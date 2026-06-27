/**
 * Grupos e comunidades — cross-tenant (reúnem pessoas de negócios diferentes).
 * Lista pública; qualquer logado entra; cada grupo tem um mural de mensagens.
 */
import { prisma } from './prisma';

export interface GrupoItem {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  membros: number;
  sou: boolean;
}

export async function listarGrupos(userId: string): Promise<GrupoItem[]> {
  const gs = await prisma.grupo.findMany({
    include: { _count: { select: { membros: true } }, membros: { where: { userId }, select: { id: true }, take: 1 } },
    orderBy: { criadoEm: 'desc' },
    take: 200,
  });
  return gs.map((g) => ({
    id: g.id,
    nome: g.nome,
    descricao: g.descricao ?? '',
    categoria: g.categoria ?? '',
    membros: g._count.membros,
    sou: g.membros.length > 0,
  }));
}

export async function criarGrupo(
  userId: string,
  dados: { nome: string; descricao: string; categoria: string },
): Promise<string> {
  const g = await prisma.grupo.create({
    data: {
      donoId: userId,
      nome: dados.nome,
      descricao: dados.descricao || null,
      categoria: dados.categoria || null,
      membros: { create: [{ userId }] }, // dono já entra
    },
  });
  return g.id;
}

export async function ehMembro(grupoId: string, userId: string): Promise<boolean> {
  const m = await prisma.grupoMembro.findFirst({ where: { grupoId, userId } });
  return Boolean(m);
}

export async function entrarGrupo(grupoId: string, userId: string): Promise<void> {
  await prisma.grupoMembro.upsert({
    where: { grupoId_userId: { grupoId, userId } },
    update: {},
    create: { grupoId, userId },
  });
}

export async function sairGrupo(grupoId: string, userId: string): Promise<void> {
  await prisma.grupoMembro.deleteMany({ where: { grupoId, userId } });
}

export interface GrupoDetalhe {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  sou: boolean;
  membros: { id: string; nome: string }[];
  mensagens: { id: string; autorId: string; autor: string; texto: string; criadoEm: string }[];
}

export async function grupoDetalhe(grupoId: string, userId: string): Promise<GrupoDetalhe | null> {
  const g = await prisma.grupo.findUnique({
    where: { id: grupoId },
    include: {
      membros: { include: { user: { select: { id: true, nome: true } } }, take: 100 },
      mensagens: {
        include: { autor: { select: { nome: true } } },
        orderBy: { criadoEm: 'desc' },
        take: 100,
      },
    },
  });
  if (!g) return null;
  return {
    id: g.id,
    nome: g.nome,
    descricao: g.descricao ?? '',
    categoria: g.categoria ?? '',
    sou: g.membros.some((m) => m.userId === userId),
    membros: g.membros.map((m) => ({ id: m.user.id, nome: m.user.nome })),
    mensagens: g.mensagens
      .slice()
      .reverse()
      .map((m) => ({
        id: m.id,
        autorId: m.autorId,
        autor: m.autor.nome,
        texto: m.texto,
        criadoEm: m.criadoEm.toISOString(),
      })),
  };
}

export async function postarNoGrupo(grupoId: string, userId: string, texto: string): Promise<boolean> {
  const t = texto.trim();
  if (!t || !(await ehMembro(grupoId, userId))) return false;
  await prisma.grupoMensagem.create({ data: { grupoId, autorId: userId, texto: t.slice(0, 2000) } });
  return true;
}
