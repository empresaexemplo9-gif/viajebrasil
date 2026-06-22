/**
 * Utilidades HTTP compartilhadas pelas Vercel Functions.
 * Tipos mínimos de req/res (evita depender de `@vercel/node`).
 */

export interface Req {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
}

export interface Res {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  setHeader: (chave: string, valor: string) => void;
  end: (dados?: string) => void;
}

/** Erro com status HTTP — capturado por `responderErro`. */
export class HttpErro extends Error {
  constructor(
    readonly status: number,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = 'HttpErro';
  }
}

/** Libera CORS (o app web é mesma origem; ajuda previews e nativo). */
export function aplicarCors(res: Res): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/** Corpo JSON tolerante (objeto, string JSON ou vazio). */
export function corpoJson(req: Req): Record<string, any> {
  const b = req.body;
  if (typeof b === 'string') {
    try {
      return JSON.parse(b) as Record<string, any>;
    } catch {
      return {};
    }
  }
  return (b ?? {}) as Record<string, any>;
}

/** Lê um parâmetro de query string (primeiro valor, se vier array). */
export function lerQuery(req: Req, chave: string): string | undefined {
  const v = req.query?.[chave];
  return Array.isArray(v) ? v[0] : v;
}

/** Lê um header (case-insensitive). */
export function lerHeader(req: Req, chave: string): string | undefined {
  const v = req.headers?.[chave.toLowerCase()];
  return Array.isArray(v) ? v[0] : v;
}

/** Responde um erro padronizado (usa o status de `HttpErro`). */
export function responderErro(res: Res, e: unknown): void {
  if (e instanceof HttpErro) {
    res.status(e.status).json({ ok: false, erro: e.message });
    return;
  }
  console.error('[api] erro inesperado:', e);
  res.status(500).json({ ok: false });
}
