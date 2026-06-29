/**
 * Feed de publicações. Posts são públicos: aparecem no feed global e no perfil
 * do autor, visíveis para qualquer visitante.
 *
 * Ações do autor: editar, excluir, compartilhar (no chat interno ou em mídias
 * externas). Moderação: filtro de linguajar ao publicar/editar, denúncia por
 * qualquer usuário e remoção pelo superadmin.
 */
import { prisma } from './prisma';
import { analisarTexto, MENSAGEM_BLOQUEIO } from '../moderacao';
import { iniciarConversa, enviarMensagem } from './chat';
import { criarNotificacao } from './notificacoes';

export interface PostView {
  id: string;
  autorId: string;
  autorNome: string;
  autorAvatar: string;
  texto: string;
  imagemUrl: string;
  criadoEm: string;
}

/** Resultado de operações que passam por moderação. */
export interface ResultadoPost {
  ok: boolean;
  erro?: string;
}

function mapear(p: {
  id: string;
  autorId: string;
  texto: string;
  imagemUrl: string | null;
  criadoEm: Date;
  autor: { nome: string; avatarUrl: string | null };
}): PostView {
  return {
    id: p.id,
    autorId: p.autorId,
    autorNome: p.autor.nome,
    autorAvatar: p.autor.avatarUrl ?? '',
    texto: p.texto,
    imagemUrl: p.imagemUrl ?? '',
    criadoEm: p.criadoEm.toISOString(),
  };
}

export async function criarPost(
  userId: string,
  tenantId: string,
  texto: string,
  imagemUrl: string,
): Promise<ResultadoPost> {
  const t = texto.trim();
  if (!t && !imagemUrl) return { ok: false, erro: 'Escreva algo ou adicione uma imagem.' };
  if (analisarTexto(t).proibido) return { ok: false, erro: MENSAGEM_BLOQUEIO };
  await prisma.post.create({
    data: { autorId: userId, tenantId, texto: t.slice(0, 2000), imagemUrl: imagemUrl || null },
  });
  return { ok: true };
}

/** Edita o próprio post (texto e/ou imagem). Passa por moderação. */
export async function editarPost(
  userId: string,
  id: string,
  texto: string,
  imagemUrl: string,
): Promise<ResultadoPost> {
  const t = texto.trim();
  if (!t && !imagemUrl) return { ok: false, erro: 'A publicação não pode ficar vazia.' };
  if (analisarTexto(t).proibido) return { ok: false, erro: MENSAGEM_BLOQUEIO };
  const r = await prisma.post.updateMany({
    where: { id, autorId: userId },
    data: { texto: t.slice(0, 2000), imagemUrl: imagemUrl || null },
  });
  if (r.count === 0) return { ok: false, erro: 'Publicação não encontrada ou sem permissão.' };
  return { ok: true };
}

export async function feedGlobal(limit = 60): Promise<PostView[]> {
  const posts = await prisma.post.findMany({
    include: { autor: { select: { nome: true, avatarUrl: true } } },
    orderBy: { criadoEm: 'desc' },
    take: limit,
  });
  return posts.map(mapear);
}

export async function postsDoPerfil(userId: string, limit = 30): Promise<PostView[]> {
  const posts = await prisma.post.findMany({
    where: { autorId: userId },
    include: { autor: { select: { nome: true, avatarUrl: true } } },
    orderBy: { criadoEm: 'desc' },
    take: limit,
  });
  return posts.map(mapear);
}

export async function postPorId(id: string): Promise<PostView | null> {
  const p = await prisma.post.findUnique({
    where: { id },
    include: { autor: { select: { nome: true, avatarUrl: true } } },
  });
  return p ? mapear(p) : null;
}

export async function excluirPost(userId: string, id: string): Promise<void> {
  await prisma.post.deleteMany({ where: { id, autorId: userId } });
}

/** Remoção pelo superadmin (qualquer post). */
export async function excluirPostComoAdmin(id: string): Promise<void> {
  await prisma.post.deleteMany({ where: { id } });
}

/**
 * Compartilha um post no chat interno com outro usuário (por e-mail). Cria/abre
 * a conversa 1:1, envia a mensagem e notifica o destinatário.
 */
export async function compartilharPostNoChat(
  meuId: string,
  postId: string,
  emailDestino: string,
): Promise<ResultadoPost> {
  const email = emailDestino.trim().toLowerCase();
  if (!email) return { ok: false, erro: 'Informe o e-mail do destinatário.' };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { autor: { select: { nome: true } } },
  });
  if (!post) return { ok: false, erro: 'Publicação não encontrada.' };

  const destino = await prisma.user.findFirst({
    where: { email },
    select: { id: true, tenantId: true },
  });
  if (!destino) return { ok: false, erro: 'Nenhum perfil com esse e-mail na plataforma.' };
  if (destino.id === meuId) return { ok: false, erro: 'Você não pode compartilhar consigo mesmo.' };

  const conversaId = await iniciarConversa(meuId, email);
  if (!conversaId) return { ok: false, erro: 'Não foi possível abrir a conversa.' };

  const resumo = post.texto ? `"${post.texto.slice(0, 140)}"` : '(imagem)';
  const enviado = await enviarMensagem(
    conversaId,
    meuId,
    `📣 Compartilhou uma publicação de ${post.autor.nome}: ${resumo}`,
  );
  if (!enviado) return { ok: false, erro: 'Não foi possível enviar a mensagem.' };

  await criarNotificacao(
    destino.tenantId,
    destino.id,
    'compartilhamento',
    `Você recebeu uma publicação de ${post.autor.nome} no chat.`,
  );
  return { ok: true };
}

/** Registra uma denúncia de publicação para revisão do superadmin. */
export async function denunciarPost(
  postId: string,
  denuncianteId: string | null,
  motivo: string,
): Promise<ResultadoPost> {
  const existe = await prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
  if (!existe) return { ok: false, erro: 'Publicação não encontrada.' };
  await prisma.denuncia.create({
    data: { postId, denuncianteId, motivo: (motivo || 'Conteúdo impróprio').slice(0, 300) },
  });
  return { ok: true };
}

export interface DenunciaView {
  id: string;
  postId: string;
  motivo: string;
  criadoEm: string;
  postTexto: string;
  postImagem: string;
  autorId: string;
  autorNome: string;
}

/** Lista denúncias pendentes (superadmin). */
export async function listarDenuncias(limit = 100): Promise<DenunciaView[]> {
  const ds = await prisma.denuncia.findMany({
    where: { resolvida: false },
    include: { post: { include: { autor: { select: { id: true, nome: true } } } } },
    orderBy: { criadoEm: 'desc' },
    take: limit,
  });
  return ds.map((d) => ({
    id: d.id,
    postId: d.postId,
    motivo: d.motivo,
    criadoEm: d.criadoEm.toISOString(),
    postTexto: d.post.texto,
    postImagem: d.post.imagemUrl ?? '',
    autorId: d.post.autor.id,
    autorNome: d.post.autor.nome,
  }));
}

/** Marca uma denúncia como resolvida (sem apagar o post). */
export async function resolverDenuncia(id: string): Promise<void> {
  await prisma.denuncia.updateMany({ where: { id }, data: { resolvida: true } });
}
