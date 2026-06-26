# DRAP Business

Hub digital de negócios e conexões que une **banco de vagas com IA, vitrine de
produtos/serviços, monetização por visibilidade e captação** — em uma plataforma
**multi-tenant** (cada empresa/profissional é um espaço isolado).

Site **web, mobile-first** (abre e instala como app no Android e no iPhone via
"Adicionar à tela inicial").

## Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **Backend:** Node.js + Prisma + **PostgreSQL** (Vercel Postgres)
- **Auth:** NextAuth (e-mail+senha e OAuth Google/LinkedIn), JWT com claims de
  tenant/papel/plano; RBAC com 7 papéis
- **IA:** API da Anthropic para classificação de currículos (com heurística de
  fallback que já funciona sem chave)
- **Isolamento:** multi-tenant com `tenantId` em todas as consultas (RLS no
  banco disponível em `prisma/rls.sql` como reforço)

## Implementado (em produção)

- **Multi-tenant + auth** — cadastro cria um negócio (tenant) e um super_admin;
  login por e-mail+senha (slug opcional) ou OAuth; RBAC, rate limiting, bloqueio
  após 5 falhas e trilha de auditoria.
- **Banco de Vagas** — empresa publica vaga (`/painel/vagas`), candidato se
  inscreve (`/vagas` → `/vagas/[id]`) e a **IA classifica o currículo (0–100)**
  por aderência, experiência, certificações e referências.
- **Painel Prime** (`/painel/prime`) — ranking de candidatos pela IA, score
  médio, exibições × cliques e ROI estimado.
- **Vitrine** (`/vitrine`, `/painel/vitrine`) — produtos/serviços com destaque e
  alcance por plano.
- **Monetização por visibilidade** (`/planos`) — Free + Prime (Básico/Pro/Elite),
  com trial de 7 dias e preços editáveis no admin (`/admin/planos`).
- **Modelo de visibilidade por plano** (`src/lib/visibilidade.ts`) — o plano não
  altera o mérito (score da IA), apenas o **alcance e o destaque/posicionamento**
  de empresas, vendedores/prestadores e candidatos (CLT).

## Publicar (deploy)

Passo a passo completo em **[`PUBLICAR.md`](./PUBLICAR.md)** e detalhes da
fundação em **[`SETUP-MULTITENANT.md`](./SETUP-MULTITENANT.md)**.

Resumo (Vercel): criar **Postgres** (injeta `DATABASE_URL`), definir
`NEXTAUTH_SECRET` e `NEXTAUTH_URL`, e fazer deploy. O build aplica o schema
automaticamente (`prisma db push`) — sem terminal local.

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de produção (gera Prisma + aplica schema + next build)
npm run type-check
```

Variáveis: copie `.env.example` para `.env` e preencha `DATABASE_URL`,
`NEXTAUTH_SECRET`, `NEXTAUTH_URL` (e, opcionalmente, `ANTHROPIC_API_KEY` e as
chaves OAuth).

## Próximas fases

- **Cobrança real** (gateway de pagamento) para as assinaturas Prime
- **RLS** ativo no banco (com papel de bypass para login/cadastro)
- **OAuth social** ativo · **CRM nativo** · **Central de propostas (PDF)** ·
  Grupos/comunidades · Motor de engajamento

## Identidade

DRAP Business — tom profissional e acessível, foco no mercado brasileiro. Marca do
kit: acento **coral `#FF4D2E`**, fundos **ink navy** (`#0B1018`–`#232C3D`) e
**creme** `#FBFBF2`; o símbolo é a barra cortando o "D". Interface limpa,
mobile-first.
