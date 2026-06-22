/**
 * Acesso ao Postgres (Neon) para as Vercel Functions, com isolamento por tenant.
 *
 * Toda leitura/escrita em tabelas com RLS deve passar por `comTenant`, que seta
 * `app.current_tenant` na MESMA transação (como exige o RLS FORCEd). A tabela
 * `tenants` NÃO tem FORCE, então o dono do banco resolve `slug → id` direto.
 */
import { neon, type NeonQueryFunction, type NeonQueryPromise } from '@neondatabase/serverless';
import { HttpErro } from './http';

export type Sql = NeonQueryFunction<false, false>;
/** Tipo de uma query no formato aceito por `sql.transaction([...])`. */
type Consulta = NeonQueryPromise<false, false, any>;

/** Cria o cliente SQL (lança se faltar DATABASE_URL). */
export function obterSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new HttpErro(500, 'DATABASE_URL ausente');
  return neon(url);
}

/** Resolve o slug do tenant para o uuid (sem RLS na tabela `tenants`). */
export async function resolverTenantId(sql: Sql, slug: string): Promise<string> {
  const linhas = await sql`select id from tenants where slug = ${slug} limit 1`;
  const id = linhas[0]?.id as string | undefined;
  if (!id) throw new HttpErro(400, `tenant desconhecido: ${slug}`);
  return id;
}

/**
 * Executa `queries` numa transação com o tenant corrente ativo (RLS).
 * Retorna os resultados ALINHADOS a `queries` (sem o set_config inicial).
 */
export async function comTenant(
  sql: Sql,
  tenantId: string,
  queries: Consulta[],
): Promise<Record<string, any>[][]> {
  const resultados = await sql.transaction([
    sql`select set_config('app.current_tenant', ${tenantId}, true)`,
    ...queries,
  ]);
  return resultados.slice(1) as Record<string, any>[][];
}
