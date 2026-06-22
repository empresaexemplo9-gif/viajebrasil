/** Serviços do painel: listar/obter/atualizar leads (consultor e admin). */
import type { Lead, StatusLead } from '../tipos';
import { enviarJson, getJson } from './apiVercel';

export interface FiltroLeads {
  status?: StatusLead;
  consultorId?: string; // só admin
  limit?: number;
  offset?: number;
}

function querystring(filtros: FiltroLeads): string {
  const p = new URLSearchParams();
  if (filtros.status) p.set('status', filtros.status);
  if (filtros.consultorId) p.set('consultorId', filtros.consultorId);
  if (filtros.limit) p.set('limit', String(filtros.limit));
  if (filtros.offset) p.set('offset', String(filtros.offset));
  const s = p.toString();
  return s ? `?${s}` : '';
}

export async function listarLeads(filtros: FiltroLeads = {}): Promise<Lead[]> {
  const { leads } = await getJson<{ leads: Lead[] }>(`/api/leads${querystring(filtros)}`);
  return leads;
}

export async function obterLead(id: string): Promise<Lead> {
  const { lead } = await getJson<{ lead: Lead }>(`/api/leads/${id}`);
  return lead;
}

export async function atualizarLead(
  id: string,
  patch: { status?: StatusLead; consultorId?: string },
): Promise<Lead> {
  const { lead } = await enviarJson<{ lead: Lead }>('PATCH', `/api/leads/${id}`, patch);
  return lead;
}
