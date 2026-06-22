-- ViajeBrasil — conteúdo da home editável pelo admin (ofertas/badges)
-- Banco: PostgreSQL (Neon). Aplique no SQL Editor após 003.
--
-- Ofertas exibidas na home do cliente, gerenciadas pelo admin (título, cidade,
-- preço, imagem, badge, ordem e ativo). Isoladas por tenant via RLS.

begin;

create table if not exists home_ofertas (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  titulo     text not null,
  cidade     text,
  preco      numeric(10,2),
  imagem_url text,
  badge      text,                  -- ex.: "20% OFF", "Em alta"
  ordem      int  not null default 0,
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now()
);

create index if not exists idx_home_ofertas_tenant on home_ofertas (tenant_id, ordem);

alter table home_ofertas enable row level security;
alter table home_ofertas force  row level security;

drop policy if exists tenant_isolation_home_ofertas on home_ofertas;
create policy tenant_isolation_home_ofertas on home_ofertas
  using (tenant_id = current_tenant_id())
  with check (tenant_id = current_tenant_id());

commit;
