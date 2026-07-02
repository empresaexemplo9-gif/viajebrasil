'use server';

/**
 * Ações de moderação do superadmin sobre perfis, usadas pelo menu (⋯) dos cards
 * da lista de perfis. Exigem e-mail em ADMIN_EMAILS.
 */
import { revalidatePath } from 'next/cache';
import { obterContexto } from '@/lib/server/session';
import { ehAdminPlataforma, excluirUsuario, alterarStatusUsuario } from '@/lib/server/admin';

export interface ResultadoAcao {
  ok: boolean;
  erro?: string;
}

async function exigirAdmin(): Promise<boolean> {
  const ctx = await obterContexto();
  return Boolean(ctx && ehAdminPlataforma(ctx.email));
}

export async function acaoExcluirPerfil(perfilId: string): Promise<ResultadoAcao> {
  if (!(await exigirAdmin())) return { ok: false, erro: 'Sem permissão.' };
  await excluirUsuario(perfilId);
  revalidatePath('/perfil');
  return { ok: true };
}

export async function acaoSuspenderPerfil(perfilId: string, suspender: boolean): Promise<ResultadoAcao> {
  if (!(await exigirAdmin())) return { ok: false, erro: 'Sem permissão.' };
  await alterarStatusUsuario(perfilId, suspender);
  revalidatePath('/perfil');
  return { ok: true };
}
