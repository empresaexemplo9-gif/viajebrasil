/**
 * CRM nativo — funil de leads por tenant (sob withTenant/RLS) + captação de
 * clientes (link público, perfil e vitrine) com notificação por e-mail.
 */
import { prisma, withTenant } from './prisma';

export type Etapa = 'novo' | 'contato' | 'proposta' | 'ganho' | 'perdido';

export const ETAPAS: { v: Etapa; r: string }[] = [
  { v: 'novo', r: 'Novo' },
  { v: 'contato', r: 'Em contato' },
  { v: 'proposta', r: 'Proposta' },
  { v: 'ganho', r: 'Ganho' },
  { v: 'perdido', r: 'Perdido' },
];

export type TipoLead =
  | 'servico'
  | 'produto'
  | 'empresa'
  | 'orcamento'
  | 'agendamento'
  | 'recrutamento'
  | 'parceria'
  | 'outro';

export const TIPOS_LEAD: { v: TipoLead; r: string }[] = [
  { v: 'servico', r: 'Prestação de serviço' },
  { v: 'produto', r: 'Venda de produto' },
  { v: 'empresa', r: 'Contato empresa / B2B' },
  { v: 'orcamento', r: 'Pedido de orçamento' },
  { v: 'agendamento', r: 'Agendamento / reunião' },
  { v: 'recrutamento', r: 'Recrutamento (candidato)' },
  { v: 'parceria', r: 'Parceria / indicação' },
  { v: 'outro', r: 'Outro' },
];

const TIPOS_VALIDOS = new Set(TIPOS_LEAD.map((t) => t.v));
export function normalizarTipo(v: unknown): TipoLead {
  const s = String(v ?? '').trim() as TipoLead;
  return TIPOS_VALIDOS.has(s) ? s : 'servico';
}
export function rotuloTipo(v: TipoLead): string {
  return TIPOS_LEAD.find((t) => t.v === v)?.r ?? v;
}

export interface LeadView {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  tipo: TipoLead;
  tipoRotulo: string;
  descricao: string;
  valor: string;
  etapa: Etapa;
  notas: string;
}

function fmtValor(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) return '';
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export async function listarLeads(tenantId: string): Promise<LeadView[]> {
  return withTenant(tenantId, async (db) => {
    const ls = await db.lead.findMany({ where: { tenantId }, orderBy: { atualizadoEm: 'desc' }, take: 500 });
    return ls.map((l) => {
      const tipo = normalizarTipo(l.tipo);
      return {
        id: l.id,
        nome: l.nome,
        email: l.email ?? '',
        telefone: l.telefone ?? '',
        origem: l.origem ?? '',
        tipo,
        tipoRotulo: rotuloTipo(tipo),
        descricao: l.descricao ?? '',
        valor: fmtValor(l.valor),
        etapa: l.etapa as Etapa,
        notas: l.notas ?? '',
      };
    });
  });
}

export interface NovoLead {
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  tipo: TipoLead;
  descricao: string;
  valor: string;
  notas: string;
}

function parseValor(v: string): string | null {
  const n = Number(String(v).replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n.toFixed(2) : null;
}

export async function criarLead(tenantId: string, userId: string | null, dados: NovoLead): Promise<void> {
  await withTenant(tenantId, (db) =>
    db.lead.create({
      data: {
        tenantId,
        responsavelId: userId,
        nome: dados.nome,
        email: dados.email || null,
        telefone: dados.telefone || null,
        origem: dados.origem || null,
        tipo: normalizarTipo(dados.tipo) as never,
        descricao: dados.descricao || null,
        valor: parseValor(dados.valor),
        notas: dados.notas || null,
      },
    }),
  );
}

export async function moverLead(tenantId: string, id: string, etapa: Etapa): Promise<void> {
  await withTenant(tenantId, (db) =>
    db.lead.updateMany({ where: { id, tenantId }, data: { etapa: etapa as never } }),
  );
  // Ao fechar o negócio, registra automaticamente como cliente.
  if (etapa === 'ganho') await registrarClienteDeLead(tenantId, id);
}

export async function excluirLead(tenantId: string, id: string): Promise<void> {
  await withTenant(tenantId, (db) => db.lead.deleteMany({ where: { id, tenantId } }));
}

// ───────────────────────── Captação de clientes ─────────────────────────

export interface DadosCaptura {
  nome: string;
  email: string;
  telefone: string;
  tipo: TipoLead;
  descricao: string;
  valor?: string;
}

/** Quem é dono do funil de um tenant (responsável pelos leads captados). */
async function donoDoTenant(tenantId: string): Promise<{ id: string } | null> {
  const u = await prisma.user.findFirst({
    where: { tenantId },
    orderBy: { criadoEm: 'asc' },
    select: { id: true },
  });
  return u ?? null;
}

/** Dados públicos de um destino de captação (link por slug). */
export async function destinoPorSlug(
  slug: string,
): Promise<{ tenantId: string; nome: string } | null> {
  const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true, nome: true } });
  return t ? { tenantId: t.id, nome: t.nome } : null;
}

/** Captação via link público (página /c/[slug]). */
export async function captarPorSlug(slug: string, dados: DadosCaptura): Promise<boolean> {
  const t = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
  if (!t) return false;
  await registrarCaptura(t.id, dados, 'Link público');
  return true;
}

/** Captação a partir do perfil/vitrine de um usuário (cria lead no funil dele). */
export async function captarDeUsuario(
  userIdAlvo: string,
  dados: DadosCaptura,
  origem = 'Perfil',
): Promise<boolean> {
  const alvo = await prisma.user.findUnique({
    where: { id: userIdAlvo },
    select: { tenantId: true },
  });
  if (!alvo) return false;
  await registrarCaptura(alvo.tenantId, dados, origem);
  return true;
}

async function registrarCaptura(tenantId: string, dados: DadosCaptura, origem: string): Promise<void> {
  const dono = await donoDoTenant(tenantId);
  await criarLead(tenantId, dono?.id ?? null, {
    nome: dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    origem,
    tipo: dados.tipo,
    descricao: dados.descricao,
    valor: dados.valor ?? '',
    notas: '',
  });
}

// ───────────────────────── Clientes (negócios fechados) ─────────────────────────

export interface ClienteView {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  tipo: TipoLead;
  tipoRotulo: string;
  descricao: string;
  valor: string;
  desde: string;
}

/** Ao fechar um lead (Ganho), registra-o como cliente — sem duplicar. */
export async function registrarClienteDeLead(tenantId: string, leadId: string): Promise<void> {
  await withTenant(tenantId, async (db) => {
    const jaExiste = await db.cliente.findFirst({ where: { tenantId, leadId } });
    if (jaExiste) return;
    const lead = await db.lead.findFirst({ where: { id: leadId, tenantId } });
    if (!lead) return;
    await db.cliente.create({
      data: {
        tenantId,
        leadId,
        nome: lead.nome,
        email: lead.email,
        telefone: lead.telefone,
        origem: lead.origem,
        tipo: lead.tipo as never,
        descricao: lead.descricao,
        valor: lead.valor,
      },
    });
  });
}

export async function listarClientes(tenantId: string): Promise<ClienteView[]> {
  return withTenant(tenantId, async (db) => {
    const cs = await db.cliente.findMany({ where: { tenantId }, orderBy: { criadoEm: 'desc' }, take: 500 });
    return cs.map((c) => {
      const tipo = normalizarTipo(c.tipo);
      return {
        id: c.id,
        nome: c.nome,
        email: c.email ?? '',
        telefone: c.telefone ?? '',
        origem: c.origem ?? '',
        tipo,
        tipoRotulo: rotuloTipo(tipo),
        descricao: c.descricao ?? '',
        valor: fmtValor(c.valor),
        desde: c.criadoEm.toLocaleDateString('pt-BR'),
      };
    });
  });
}

export async function excluirCliente(tenantId: string, id: string): Promise<void> {
  await withTenant(tenantId, (db) => db.cliente.deleteMany({ where: { id, tenantId } }));
}

/** Slug do tenant — para montar o link de captação no painel. */
export async function slugDoTenant(tenantId: string): Promise<string> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { slug: true } });
  return t?.slug ?? '';
}
