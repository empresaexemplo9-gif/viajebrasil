-- ViajeBrasil — autenticação real (senha/JWT) e modelo de identidade
-- Banco: PostgreSQL (Neon). Aplique no SQL Editor após 001/002.
--
-- `usuarios` passa a ser a ÚNICA tabela de login (cliente/consultor/admin).
-- `consultores` vira o registro de "agente atribuível", ligado a um usuario
-- (assim o consultor LOGA e é alvo do round-robin). Consultor ativo =
-- usuarios.ativo AND consultores.ativo. `carga` = contador do round-robin.

begin;

-- Colunas de login em usuarios.
alter table usuarios
  add column if not exists password_hash text,
  add column if not exists nome          text,
  add column if not exists ativo         boolean not null default true;

create index if not exists idx_usuarios_login on usuarios (tenant_id, email);

-- Vínculo e carga em consultores.
alter table consultores
  add column if not exists usuario_id uuid references usuarios(id) on delete cascade,
  add column if not exists carga      int  not null default 0;

-- Backfill (consultor ↔ usuario). As tabelas têm FORCE RLS; desliga
-- temporariamente para o backfill multi-tenant e religa em seguida.
alter table usuarios    disable row level security;
alter table consultores disable row level security;

insert into usuarios (tenant_id, email, papel, nome, ativo)
select c.tenant_id, c.email, 'consultor', c.nome, c.ativo
from consultores c
where not exists (
  select 1 from usuarios u where u.tenant_id = c.tenant_id and u.email = c.email
);

update consultores c
set usuario_id = u.id
from usuarios u
where u.tenant_id = c.tenant_id and u.email = c.email and c.usuario_id is null;

alter table usuarios    enable row level security;
alter table usuarios    force  row level security;
alter table consultores enable row level security;
alter table consultores force  row level security;

commit;
