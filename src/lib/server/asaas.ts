/**
 * Cliente do Asaas (gateway de pagamento) — chamadas REST autenticadas.
 *
 * Variáveis de ambiente (Vercel):
 *   ASAAS_API_KEY        — chave de API (access_token). Sem ela, o Asaas fica
 *                          inativo e a assinatura cai no modo demonstração.
 *   ASAAS_AMBIENTE       — "producao" (padrão) ou "sandbox".
 *   ASAAS_WEBHOOK_TOKEN  — token para validar os webhooks recebidos do Asaas.
 *
 * Docs: https://docs.asaas.com — autenticação por header `access_token`.
 */

function chave(): string | undefined {
  return process.env.ASAAS_API_KEY?.trim() || undefined;
}

/** True quando há chave de API configurada. */
export function asaasAtivo(): boolean {
  return Boolean(chave());
}

/** Sandbox quando ASAAS_AMBIENTE indica homologação/sandbox; senão produção. */
function ehSandbox(): boolean {
  const a = (process.env.ASAAS_AMBIENTE ?? 'producao').trim().toLowerCase();
  return a.startsWith('sand') || a.startsWith('homolog') || a.startsWith('hml') || a.startsWith('test');
}

function baseUrl(): string {
  return ehSandbox() ? 'https://sandbox.asaas.com/api/v3' : 'https://api.asaas.com/v3';
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'DELETE';

/** Faz uma requisição autenticada ao Asaas e devolve o JSON (lança em erro). */
export async function asaasFetch<T = any>(
  path: string,
  opts: { method?: Metodo; body?: unknown } = {},
): Promise<T> {
  const key = chave();
  if (!key) throw new Error('ASAAS_API_KEY ausente');

  const res = await fetch(`${baseUrl()}${path}`, {
    method: opts.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      access_token: key,
      'User-Agent': 'DRAP Business',
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });

  const data = (await res.json().catch(() => null)) as
    | (T & { errors?: { code?: string; description?: string }[] })
    | null;

  if (!res.ok) {
    const msg = data?.errors?.[0]?.description || res.statusText;
    throw new Error(`Asaas ${res.status}: ${msg}`);
  }
  return data as T;
}
