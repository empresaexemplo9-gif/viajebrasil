/**
 * CRM nativo — funil de leads por tenant (sob withTenant/RLS).
 */
import { withTenant } from './prisma';

export type Etapa = 'novo' | 'contato' | 'proposta' | 'ganho' | 'perdido';

export const ETAPAS: { v: Etapa; r: string }[] = [
  { v: 'novo', r: 'Novo' },
  { v: 'contato', r: 'Em contato' },
  { v: 'proposta', r: 'Proposta' },
  { v: 'ganho', r: 'Ganho' },
  { v: 'perdido', r: 'Perdido' },
];

export interface LeadView {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  origem: string;
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
    return ls.map((l) => ({
      id: l.id,
      nome: l.nome,
      email: l.email ?? '',
      telefone: l.telefone ?? '',
      origem: l.origem ?? '',
      valor: fmtValor(l.valor),
      etapa: l.etapa as Etapa,
      notas: l.notas ?? '',
    }));
  });
}

export interface NovoLead {
  nome: string;
  email: string;
  telefone: string;
  origem: string;
  valor: string;
  notas: string;
}

export async function criarLead(tenantId: string, userId: string, dados: NovoLead): Promise<void> {
  const valorNum = Number(String(dados.valor).replace(/[^\d,.-]/g, '').replace(',', '.'));
  await withTenant(tenantId, (db) =>
    db.lead.create({
      data: {
        tenantId,
        responsavelId: userId,
        nome: dados.nome,
        email: dados.email || null,
        telefone: dados.telefone || null,
        origem: dados.origem || null,
        valor: Number.isFinite(valorNum) && valorNum > 0 ? valorNum.toFixed(2) : null,
        notas: dados.notas || null,
      },
    }),
  );
}

export async function moverLead(tenantId: string, id: string, etapa: Etapa): Promise<void> {
  await withTenant(tenantId, (db) =>
    db.lead.updateMany({ where: { id, tenantId }, data: { etapa: etapa as never } }),
  );
}

export async function excluirLead(tenantId: string, id: string): Promise<void> {
  await withTenant(tenantId, (db) => db.lead.deleteMany({ where: { id, tenantId } }));
}
