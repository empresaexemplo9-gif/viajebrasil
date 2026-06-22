/**
 * Autenticação das Vercel Functions: assinatura/verificação de JWT e checagem
 * de papel. NUNCA confiar em papel/tenant vindos do cliente — sempre do token
 * verificado.
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { HttpErro, lerHeader, type Req } from './http';

export type Papel = 'cliente' | 'consultor' | 'admin';

export interface Claims {
  sub: string; // usuario.id
  tenant_id: string; // uuid do tenant
  papel: Papel;
}

const CUSTO_BCRYPT = 11;

function segredo(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new HttpErro(500, 'JWT_SECRET ausente');
  return s;
}

/** Assina um JWT (HS256, expira em 7 dias). */
export function assinarToken(claims: Claims): string {
  return jwt.sign(claims, segredo(), { expiresIn: '7d' });
}

/** Verifica o Bearer da requisição e devolve as claims (lança 401). */
export function verificarRequisicao(req: Req): Claims {
  const cabecalho = lerHeader(req, 'authorization');
  if (!cabecalho) throw new HttpErro(401, 'autenticação necessária');
  const token = cabecalho.replace(/^Bearer\s+/i, '');
  try {
    const dec = jwt.verify(token, segredo()) as Claims;
    if (!dec?.sub || !dec?.tenant_id || !dec?.papel) throw new Error('claims incompletas');
    return dec;
  } catch {
    throw new HttpErro(401, 'token inválido ou expirado');
  }
}

/** Garante que o papel das claims está entre os permitidos (lança 403). */
export function exigirPapel(claims: Claims, ...papeis: Papel[]): void {
  if (!papeis.includes(claims.papel)) throw new HttpErro(403, 'sem permissão');
}

/** Gera o hash de uma senha. */
export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, CUSTO_BCRYPT);
}

/** Confere a senha contra o hash. */
export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
