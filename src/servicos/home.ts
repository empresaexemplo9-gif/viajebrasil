/** Conteúdo da home (ofertas) — leitura pública e CRUD do admin. */
import type { HomeOferta } from '../tipos';
import { TENANT } from './config';
import { enviarJson, getJson } from './apiVercel';

/** Ofertas ativas para a home do cliente (público). `[]` se indisponível. */
export async function listarOfertasHome(): Promise<HomeOferta[]> {
  try {
    const { ofertas } = await getJson<{ ofertas: HomeOferta[] }>(
      `/api/home/ofertas?tenantId=${encodeURIComponent(TENANT.id)}`,
    );
    return ofertas;
  } catch {
    return [];
  }
}

/** Todas as ofertas (admin, inclui inativas). */
export async function listarOfertasAdmin(): Promise<HomeOferta[]> {
  const { ofertas } = await getJson<{ ofertas: HomeOferta[] }>('/api/admin/ofertas');
  return ofertas;
}

export async function criarOferta(dados: Partial<HomeOferta>): Promise<HomeOferta> {
  const { oferta } = await enviarJson<{ oferta: HomeOferta }>('POST', '/api/admin/ofertas', dados);
  return oferta;
}

export async function atualizarOferta(id: string, dados: Partial<HomeOferta>): Promise<HomeOferta> {
  const { oferta } = await enviarJson<{ oferta: HomeOferta }>('PATCH', '/api/admin/ofertas', { id, ...dados });
  return oferta;
}

export async function excluirOferta(id: string): Promise<void> {
  await enviarJson('DELETE', `/api/admin/ofertas?id=${encodeURIComponent(id)}`);
}
