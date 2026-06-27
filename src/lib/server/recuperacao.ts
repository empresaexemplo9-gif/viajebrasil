/**
 * Recuperação de senha por e-mail (token com validade de 1h).
 * Não revela se o e-mail existe (resposta neutra) — evita enumeração.
 */
import { randomUUID } from 'node:crypto';
import { prisma } from './prisma';
import { hashSenha, politicaSenha } from './password';
import { enviarEmail } from './email';

const VALIDADE_MS = 60 * 60 * 1000;

function urlBase(): string {
  return (process.env.NEXTAUTH_URL ?? '').replace(/\/$/, '');
}

/** Gera o token e envia o e-mail. Sempre resolve (resposta neutra). */
export async function solicitarReset(email: string): Promise<void> {
  const e = email.trim().toLowerCase();
  if (!e) return;
  // Pode haver o mesmo e-mail em vários tenants; envia link para cada conta.
  const usuarios = await prisma.user.findMany({ where: { email: e }, select: { id: true, nome: true } });
  for (const u of usuarios) {
    const token = `${randomUUID()}${randomUUID()}`.replace(/-/g, '');
    await prisma.resetSenha.create({
      data: { userId: u.id, token, expiraEm: new Date(Date.now() + VALIDADE_MS) },
    });
    const link = `${urlBase()}/redefinir-senha?token=${token}`;
    await enviarEmail({
      para: e,
      assunto: 'Redefinir sua senha — DRAP Business',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2 style="color:#0E1421">Redefinir senha</h2>
          <p>Olá, ${u.nome}. Recebemos um pedido para redefinir sua senha na DRAP Business.</p>
          <p><a href="${link}" style="display:inline-block;background:#FF4D2E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Criar nova senha</a></p>
          <p style="color:#64748b;font-size:13px">O link vale por 1 hora. Se você não pediu isso, ignore este e-mail.</p>
        </div>`,
    });
  }
}

export interface ResultadoReset {
  ok: boolean;
  erro?: string;
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<ResultadoReset> {
  const checa = politicaSenha(novaSenha);
  if (!checa.ok) return { ok: false, erro: checa.erros.join(' ') };

  const reg = await prisma.resetSenha.findUnique({ where: { token } });
  if (!reg || reg.usado || reg.expiraEm < new Date()) {
    return { ok: false, erro: 'Link inválido ou expirado. Peça um novo.' };
  }
  const hash = await hashSenha(novaSenha);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: reg.userId },
      data: { senhaHash: hash, tentativasLogin: 0, bloqueadoAte: null },
    }),
    prisma.resetSenha.update({ where: { id: reg.id }, data: { usado: true } }),
  ]);
  return { ok: true };
}
