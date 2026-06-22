-- ViajeBrasil — seção da oferta na home (carrossel "Destino em alta" vs grade)
-- Banco: PostgreSQL (Neon). Aplique no SQL Editor após 004.
--
-- `secao = 'destaque'` → aparece no carrossel "Destino em alta" (topo).
-- `secao = 'oferta'`   → aparece na grade "Ofertas imperdíveis" (padrão).
-- Assim o admin gerencia as DUAS seções da home pela mesma tela.

begin;

alter table home_ofertas
  add column if not exists secao text not null default 'oferta';

alter table home_ofertas drop constraint if exists home_ofertas_secao_chk;
alter table home_ofertas
  add constraint home_ofertas_secao_chk check (secao in ('destaque', 'oferta'));

commit;
