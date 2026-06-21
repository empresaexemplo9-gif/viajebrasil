/**
 * Vercel Function — recebe os leads do chatbot de Passagens Aéreas do app.
 *
 * Fica no MESMO domínio do app web (ex.: viajebrasil.vercel.app/api/leads-aereo),
 * então o app a chama em mesma origem. Responsabilidades:
 *   1. Persistir o lead no Postgres (Neon) respeitando o RLS por tenant.
 *   2. Notificar o consultor por e-mail (Resend).
 *
 * Variáveis de ambiente (Settings → Environment Variables na Vercel):
 *   DATABASE_URL      conexão do Neon (criada pela integração).
 *   RESEND_API_KEY    chave da API do Resend.
 *   EMAIL_FROM        remetente (ex.: "ViajeBrasil <onboarding@resend.dev>").
 *   CONSULTOR_EMAIL   destino padrão dos leads.
 *   NOTIFY_ON_START   "false" desliga o e-mail no início do chat (padrão: liga).
 */
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

// Tipos mínimos da requisição/resposta da Vercel (evita depender de @vercel/node).
interface Req {
  method?: string;
  body?: unknown;
}
interface Res {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (chave: string, valor: string) => void;
  end: (dados?: string) => void;
}

export default async function handler(req: Req, res: Res) {
  // CORS — o app web é mesma origem; liberar ajuda previews e builds nativos.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, erro: 'método não permitido' });

  const corpo = (typeof req.body === 'string' ? parse(req.body) : (req.body ?? {})) as Record<string, any>;
  const tipo: 'inicio' | 'completo' = corpo.tipo === 'inicio' ? 'inicio' : 'completo';
  const tenantSlug = String(corpo.tenantId ?? 'viajebrasil');

  try {
    if (tipo === 'completo') {
      await registrarLead(tenantSlug, corpo.lead ?? {}, String(corpo.origem ?? ''));
    }
    await notificarConsultor(tipo, corpo);
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('[leads-aereo] falha:', e);
    return res.status(500).json({ ok: false });
  }
}

function parse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

/** Insere o lead aplicando o tenant corrente (ativa o RLS na transação). */
async function registrarLead(tenantSlug: string, lead: Record<string, any>, origem: string) {
  const conexao = process.env.DATABASE_URL;
  if (!conexao) {
    console.warn('[leads-aereo] DATABASE_URL ausente — pulando persistência');
    return;
  }
  const sql = neon(conexao);

  // O dono do banco enxerga `tenants` (RLS habilitada, mas não forçada nela).
  const tenants = await sql`select id from tenants where slug = ${tenantSlug} limit 1`;
  const tenantId = tenants[0]?.id as string | undefined;
  if (!tenantId) throw new Error(`tenant desconhecido: ${tenantSlug}`);

  const nomes: string[] = Array.isArray(lead.nomes) ? lead.nomes.map(String) : [];
  const numero = Number(lead.numeroPassageiros) || nomes.length || 1;
  const telefone = String(lead.telefone ?? '');
  const contatoNome = nomes[0] ?? null;

  // Mesma transação: define o tenant corrente e insere — `leads_aereo` tem
  // FORCE ROW LEVEL SECURITY, então o INSERT só passa com o tenant batendo.
  await sql.transaction([
    sql`select set_config('app.current_tenant', ${tenantId}, true)`,
    sql`insert into leads_aereo
          (tenant_id, numero_passageiros, nomes, data_ida, data_volta, classe,
           contato_nome, contato_telefone, origem)
        values
          (${tenantId}, ${numero}, ${nomes}::text[], ${String(lead.dataIda ?? '')},
           ${lead.dataVolta ?? null}, ${String(lead.classe ?? '')},
           ${contatoNome}, ${telefone || null}, ${origem})`,
  ]);
}

/** Envia o e-mail ao consultor via Resend. */
async function notificarConsultor(tipo: 'inicio' | 'completo', corpo: Record<string, any>) {
  const apiKey = process.env.RESEND_API_KEY;
  const para = String(corpo.consultorEmail || process.env.CONSULTOR_EMAIL || '');
  const de = process.env.EMAIL_FROM || 'ViajeBrasil <onboarding@resend.dev>';

  if (!apiKey || !para) {
    console.warn('[leads-aereo] RESEND_API_KEY/CONSULTOR_EMAIL ausentes — e-mail não enviado');
    return;
  }
  // No início do chat só envia se não estiver desligado por env.
  if (tipo === 'inicio' && process.env.NOTIFY_ON_START === 'false') return;

  const { assunto, html } = montarEmail(tipo, corpo);
  const resend = new Resend(apiKey);
  await resend.emails.send({ from: de, to: para, subject: assunto, html });
}

function montarEmail(tipo: 'inicio' | 'completo', corpo: Record<string, any>) {
  if (tipo === 'inicio') {
    return {
      assunto: '🟢 Novo atendimento de Passagem Aérea iniciado',
      html: `<p>Um cliente <strong>iniciou um atendimento de passagens aéreas</strong> no app.</p>
             <p>Os dados completos chegam em seguida, ao final do chat.</p>`,
    };
  }
  const lead = (corpo.lead ?? {}) as Record<string, any>;
  const listaNomes: string[] = Array.isArray(lead.nomes) ? lead.nomes.map(String) : [];
  const nomes = listaNomes.length ? listaNomes.join(', ') : '—';
  const volta = lead.dataVolta ?? 'Somente ida';
  const telefone = String(lead.telefone ?? '');

  // Link que abre o WhatsApp já apontando para o cliente, com mensagem pronta.
  const primeiroNome = (listaNomes[0] ?? '').split(' ')[0] || 'tudo bem';
  const saudacao =
    `Olá ${primeiroNome}! Sou consultor da ViajeBrasil e recebi seu pedido de ` +
    `passagem aérea pelo app. Vou te ajudar a encontrar as melhores opções. 😊`;
  const wpp = linkWhatsApp(telefone, saudacao);

  const botaoWpp = wpp
    ? `<p style="margin:16px 0">
         <a href="${wpp}" style="background:#25D366;color:#fff;text-decoration:none;
            padding:12px 18px;border-radius:8px;font-weight:bold;display:inline-block">
           💬 Falar com o cliente no WhatsApp
         </a>
       </p>`
    : `<p style="color:#E2483D">⚠️ Telefone não informado ou inválido — sem link de WhatsApp.</p>`;

  return {
    assunto: '✈️ Novo lead de Passagem Aérea — ViajeBrasil',
    html: `
      <h2>Novo lead de Passagem Aérea</h2>
      <ul>
        <li><strong>Passageiros:</strong> ${escape(String(lead.numeroPassageiros ?? '—'))}</li>
        <li><strong>Nome(s):</strong> ${escape(nomes)}</li>
        <li><strong>Ida:</strong> ${escape(String(lead.dataIda ?? '—'))}</li>
        <li><strong>Volta:</strong> ${escape(String(volta))}</li>
        <li><strong>Classe:</strong> ${escape(String(lead.classe ?? '—'))}</li>
        <li><strong>WhatsApp:</strong> ${escape(telefone || '—')}</li>
      </ul>
      ${botaoWpp}
      <p style="color:#5A6B85">Origem: ${escape(String(corpo.origem ?? '—'))} ·
         Tenant: ${escape(String(corpo.tenantId ?? '—'))}</p>`,
  };
}

/**
 * Monta um link `wa.me` a partir do telefone informado. Mantém só dígitos e
 * assume DDI do Brasil (55) quando ausente. Retorna `null` se for curto demais.
 */
function linkWhatsApp(telefone: string, texto: string): string | null {
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10) return null; // DDD + número
  const comDDI = digitos.startsWith('55') ? digitos : `55${digitos}`;
  return `https://wa.me/${comDDI}?text=${encodeURIComponent(texto)}`;
}

/** Escapa texto para interpolar com segurança no HTML do e-mail. */
function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
