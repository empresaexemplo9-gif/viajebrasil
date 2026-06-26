# Cobrança real com Stripe

A assinatura Prime usa **Stripe Checkout** (recorrente, com trial de 7 dias),
**webhook** como fonte de verdade e **Billing Portal** para o cliente gerenciar/
cancelar. Sem as chaves, a plataforma segue funcionando (assinar só troca o
plano, modo demonstração).

> Os preços vêm da própria plataforma (`src/lib/planos.ts`) e o checkout gera o
> valor automaticamente — **você não precisa cadastrar produtos no Stripe**.
> (Opcional: se quiser usar Prices fixos do Stripe, defina `STRIPE_PRICE_BASICO`/
> `STRIPE_PRICE_PRO`/`STRIPE_PRICE_ELITE`.)

## 1. [VOCÊ] Conta + chave secreta

1. Crie a conta em https://dashboard.stripe.com (comece em **Test mode** para
   validar sem cobrar de verdade — alterna no topo do painel).
2. **Developers → API keys** → copie a **Secret key** (`sk_test_...`).

## 2. [VOCÊ] Webhook

1. **Developers → Webhooks → Add endpoint**.
2. URL: `https://SEU_DOMINIO/api/stripe/webhook`
3. Eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Salve e copie o **Signing secret** (`whsec_...`).

## 3. [VOCÊ] Variáveis na Vercel (Settings → Environment Variables, Production)

| Variável | Valor |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_test_...` (passo 1) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (passo 2) |

Confirme também que `NEXTAUTH_URL` está com a URL pública (o checkout usa ela
para os redirects de sucesso/cancelamento).

## 4. Redeploy

Após salvar, **Deployments → ⋯ → Redeploy**. Pronto: o botão de assinar abre o
checkout do Stripe e o webhook ativa o plano ao pagar.

## Como funciona

- **Assinar / Testar 7 dias** (`/planos`) → cria a sessão de checkout (preço
  gerado a partir do plano) e redireciona ao Stripe; o trial de 7 dias é aplicado
  no "Testar".
- **Webhook** (`/api/stripe/webhook`) → ativa/atualiza/cancela: grava
  `tenant.plano`, `statusAssinatura` e a tabela `subscriptions` (com
  `paymentIdExterno` = id da assinatura). O plano é identificado pelo metadata
  `chave` gravado na assinatura.
- **Gerenciar assinatura** (`/planos`, para quem já é Prime) → abre o Billing
  Portal (trocar cartão, faturas, cancelar). Cancelou? O webhook devolve ao Free.

## Teste (Test mode)

Cartão `4242 4242 4242 4242`, validade futura, CVC qualquer. Para webhooks em
local: `stripe listen --forward-to localhost:3000/api/stripe/webhook` (Stripe CLI).

## Produção real

Ao validar em Test mode, troque para **Live mode** no Stripe, gere a `sk_live_...`
e recrie o webhook em Live (novo `whsec_...`); atualize as duas variáveis na
Vercel e redeploy.
