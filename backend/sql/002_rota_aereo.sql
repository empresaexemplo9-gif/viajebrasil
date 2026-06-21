-- ViajeBrasil — origem e destino do trecho no lead aéreo
-- Banco: PostgreSQL (Neon/Supabase). Aplique no SQL Editor do Neon.
--
-- O chatbot passou a perguntar a cidade de ORIGEM e de DESTINO da viagem.
-- Estas colunas guardam esse trecho (separadas da coluna `origem`, que indica
-- a origem do lead — ex.: "app:web"). São anuláveis para não afetar leads já
-- existentes.

alter table leads_aereo
  add column if not exists origem_cidade  text,
  add column if not exists destino_cidade text;
