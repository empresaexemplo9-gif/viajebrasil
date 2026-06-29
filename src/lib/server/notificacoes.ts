/**
 * Notificações internas. Geradas por eventos como novas mensagens de chat e
 * compartilhamento de publicações. Exibidas no sino do cabeçalho e na página
 * /painel/notificacoes.
 */
import { prisma } from './prisma';

export interface NotificacaoView {
  id: string;
  tipo: string;
  conteudo: string;
  lido: boolean;
  criadoEm: string;
}

/** Cria uma notificação para um usuário (silenciosa: nunca derruba o fluxo). */
export async function criarNotificacao(
  tenantId: string,
  userId: string,
  tipo: string,
  conteudo: string,
): Promise<void> {
  try {
    await prisma.notification.create({
      data: { tenantId, userId, tipo, conteudo: conteudo.slice(0, 500) },
    });
  } catch (e) {
    console.error('criarNotificacao falhou:', (e as Error).message);
  }
}

export async function contarNaoLidas(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({ where: { userId, lido: false } });
  } catch {
    return 0;
  }
}

export async function minhasNotificacoes(userId: string, limit = 50): Promise<NotificacaoView[]> {
  const ns = await prisma.notification.findMany({
    where: { userId },
    orderBy: { criadoEm: 'desc' },
    take: limit,
  });
  return ns.map((n) => ({
    id: n.id,
    tipo: n.tipo,
    conteudo: n.conteudo,
    lido: n.lido,
    criadoEm: n.criadoEm.toISOString(),
  }));
}

export async function marcarTodasLidas(userId: string): Promise<void> {
  await prisma.notification.updateMany({ where: { userId, lido: false }, data: { lido: true } });
}
