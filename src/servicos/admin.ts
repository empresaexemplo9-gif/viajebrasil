/** Estatísticas do painel admin. */
import { getJson } from './apiVercel';

export interface EstatisticasAdmin {
  total: number;
  convertidos: number;
  conversao: number;
  porStatus: { status: string; n: number }[];
  porConsultor: { id: string; nome: string; email: string; carga: number; leads: number }[];
  serie: { dia: string; n: number }[];
}

export async function obterEstatisticas(): Promise<EstatisticasAdmin> {
  return getJson<EstatisticasAdmin>('/api/admin/stats');
}
