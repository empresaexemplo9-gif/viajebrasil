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
  const origemCidade = String(lead.origem ?? '') || null;
  const destinoCidade = String(lead.destino ?? '') || null;

  // Mesma transação: define o tenant corrente e insere — `leads_aereo` tem
  // FORCE ROW LEVEL SECURITY, então o INSERT só passa com o tenant batendo.
  await sql.transaction([
    sql`select set_config('app.current_tenant', ${tenantId}, true)`,
    sql`insert into leads_aereo
          (tenant_id, origem_cidade, destino_cidade, numero_passageiros, nomes,
           data_ida, data_volta, classe, contato_nome, contato_telefone, origem)
        values
          (${tenantId}, ${origemCidade}, ${destinoCidade}, ${numero}, ${nomes}::text[],
           ${String(lead.dataIda ?? '')}, ${lead.dataVolta ?? null},
           ${String(lead.classe ?? '')}, ${contatoNome}, ${telefone || null}, ${origem})`,
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
    const conteudo = `
      <p style="margin:0 0 12px;font-size:15px;line-height:22px;color:#15315E">
        Um cliente <strong>iniciou um atendimento de passagens aéreas</strong> no app.
      </p>
      <p style="margin:0;font-size:14px;line-height:21px;color:#5A6B85">
        Os dados completos chegam em seguida, ao final do chat.
      </p>`;
    return {
      assunto: '🟢 Novo atendimento de Passagem Aérea iniciado',
      html: layout('Atendimento iniciado', conteudo, corpo),
    };
  }

  const lead = (corpo.lead ?? {}) as Record<string, any>;
  const listaNomes: string[] = Array.isArray(lead.nomes) ? lead.nomes.map(String) : [];
  const nomes = listaNomes.length ? listaNomes.join(', ') : '—';
  const volta = lead.dataVolta ?? 'Somente ida';
  const telefone = String(lead.telefone ?? '');

  // Link que abre o WhatsApp já apontando para o cliente, com mensagem pronta
  // que cita o pedido (passageiros, datas e classe) para contextualizar.
  const primeiroNome = (listaNomes[0] ?? '').split(' ')[0] || 'tudo bem';
  const numeroPax = Number(lead.numeroPassageiros) || listaNomes.length || 1;
  const ida = String(lead.dataIda ?? '').trim();
  const classe = String(lead.classe ?? '').trim();
  const origemViagem = String(lead.origem ?? '').trim();
  const destinoViagem = String(lead.destino ?? '').trim();
  const trecho = origemViagem || destinoViagem ? `${origemViagem || '—'} → ${destinoViagem || '—'}` : '—';
  const partes: string[] = [];
  if (origemViagem || destinoViagem) partes.push(trecho);
  partes.push(`${numeroPax} passageiro${numeroPax === 1 ? '' : 's'}`);
  if (ida) partes.push(`ida ${ida}`);
  partes.push(lead.dataVolta ? `volta ${String(lead.dataVolta)}` : 'somente ida');
  if (classe) partes.push(`classe ${classe}`);
  const resumoPedido = partes.join(', ');
  const saudacao =
    `Olá ${primeiroNome}! Sou consultor da ViajeBrasil. Recebi seu pedido de ` +
    `passagem aérea (${resumoPedido}) e já vou te ajudar a encontrar as ` +
    `melhores opções. 😊`;
  const wpp = linkWhatsApp(telefone, saudacao);

  const botaoWpp = wpp
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0">
         <tr><td style="border-radius:10px;background:#25D366">
           <a href="${wpp}" style="display:inline-block;padding:14px 24px;font-size:15px;
              font-weight:700;color:#ffffff;text-decoration:none">
             💬 Falar com o cliente no WhatsApp
           </a>
         </td></tr>
       </table>`
    : `<p style="margin:4px 0;color:#E2483D;font-size:14px">
         ⚠️ Telefone não informado ou inválido — sem link de WhatsApp.
       </p>`;

  const detalhes = [
    linhaDetalhe('Trecho', trecho),
    linhaDetalhe('Passageiros', String(lead.numeroPassageiros ?? '—')),
    linhaDetalhe('Nome(s)', nomes),
    linhaDetalhe('Ida', String(lead.dataIda ?? '—')),
    linhaDetalhe('Volta', String(volta)),
    linhaDetalhe('Classe', String(lead.classe ?? '—')),
    linhaDetalhe('WhatsApp', telefone || '—'),
  ].join('');

  const conteudo = `
    <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#15315E">
      Chegou um novo lead pelo app. Confira os detalhes e fale com o cliente:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:20px">
      ${detalhes}
    </table>
    ${botaoWpp}`;

  return {
    assunto: '✈️ Novo lead de Passagem Aérea — ViajeBrasil',
    html: layout('Novo lead de Passagem Aérea', conteudo, corpo),
  };
}

/** Uma linha rótulo/valor da tabela de detalhes do e-mail. */
function linhaDetalhe(rotulo: string, valor: string): string {
  return `
    <tr>
      <td style="padding:11px 16px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;
                 font-size:13px;font-weight:700;color:#5A6B85;width:120px">${escape(rotulo)}</td>
      <td style="padding:11px 16px;border-bottom:1px solid #E2E8F0;font-size:14px;
                 color:#15315E">${escape(valor)}</td>
    </tr>`;
}

/** Envolve o conteúdo num layout de e-mail com a identidade da ViajeBrasil. */
function layout(titulo: string, conteudo: string, corpo: Record<string, any>): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#F4F6F9">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background:#F4F6F9;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;
                    overflow:hidden;box-shadow:0 4px 16px rgba(21,49,94,0.08);
                    font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
        <tr><td style="background:#15315E;padding:22px 24px">
          <span style="font-size:19px;font-weight:800;color:#ffffff">viaje<span style="color:#1FA84C">brasil</span></span>
          <div style="margin-top:6px;font-size:13px;color:#ffffff;opacity:0.85">✈️ ${escape(titulo)}</div>
        </td></tr>
        <tr><td style="padding:24px">${conteudo}</td></tr>
        <tr><td style="padding:16px 24px;background:#F8FAFC;border-top:1px solid #E2E8F0">
          <div style="font-size:12px;color:#9AA7BD">
            Origem: ${escape(String(corpo.origem ?? '—'))} · Tenant: ${escape(String(corpo.tenantId ?? '—'))}
          </div>
          <div style="font-size:12px;color:#9AA7BD;margin-top:4px">ViajeBrasil — Realizando Sonhos</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
