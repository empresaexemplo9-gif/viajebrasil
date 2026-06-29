'use server';

/**
 * Server actions das publicações, usadas pelo menu de ferramentas do PostCard
 * (cliente). Ficam num módulo 'use server' separado para serem reaproveitadas
 * tanto no feed quanto na página de perfil.
 */
import { revalidatePath } from 'next/cache';
import { obterContexto } from '@/lib/server/session';
import { ehAdminPlataforma } from '@/lib/server/admin';
import {
  editarPost,
  excluirPost,
  excluirPostComoAdmin,
  denunciarPost,
  compartilharPostNoChat,
  type ResultadoPost,
} from '@/lib/server/feed';

const NAO_AUTENTICADO: ResultadoPost = { ok: false, erro: 'Faça login para continuar.' };

export async function acaoEditarPost(
  postId: string,
  texto: string,
  imagemUrl: string,
): Promise<ResultadoPost> {
  const ctx = await obterContexto();
  if (!ctx) return NAO_AUTENTICADO;
  const r = await editarPost(ctx.userId, postId, texto, imagemUrl);
  if (r.ok) revalidatePath('/feed');
  return r;
}

export async function acaoExcluirPost(postId: string): Promise<ResultadoPost> {
  const ctx = await obterContexto();
  if (!ctx) return NAO_AUTENTICADO;
  if (ehAdminPlataforma(ctx.email)) {
    await excluirPostComoAdmin(postId);
  } else {
    await excluirPost(ctx.userId, postId);
  }
  revalidatePath('/feed');
  return { ok: true };
}

export async function acaoDenunciarPost(postId: string, motivo: string): Promise<ResultadoPost> {
  const ctx = await obterContexto();
  // Denúncia exige login para reduzir abuso, mas não revela o denunciante ao autor.
  if (!ctx) return NAO_AUTENTICADO;
  return denunciarPost(postId, ctx.userId, motivo);
}

export async function acaoCompartilharChat(postId: string, email: string): Promise<ResultadoPost> {
  const ctx = await obterContexto();
  if (!ctx) return NAO_AUTENTICADO;
  return compartilharPostNoChat(ctx.userId, postId, email);
}
