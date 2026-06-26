# Cobrança real com Stripe

A assinatura Prime usa **Stripe Checkout** (recorrente, com trial de 7 dias),
**webhook** como fonte de verdade e **Billing Portal** para o cliente gerenciar/
cancelar. Sem as chaves, a plataforma segue funcionando (assinar só troca o
plano, modo demonstração).

## 1. [VOCÊ] Criar a conta e os preços no Stripe

1. Crie a conta em https://dashboard.stripe.com e ative o modo desejado
   (comece em **Test mode** para validar).
2. **Products** → crie 3 produtos com preço **recorrente mensal**:
   - DRAP Prime Básico → R$ 49,90/mês
   - DRAP Prime Pro → R$ 99,90/mês
   - DRAP Prime Elite → R$ 199,90/mês
3. Em cada um, copie o **Price ID** (começa com `price_...`).

## 2. [VOCÊ] Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Onde achar |
| --- | --- |
| `STRIPE_SECRET_KEY` | Developers → API keys → **Secret key** (`sk_...`) |
| `STRIPE_PRICE_BASICO` | Price ID do Básico (`price_...`) |
| `STRIPE_PRICE_PRO` | Price ID do Pro |
| `STRIPE_PRICE_ELITE` | Price ID do Elite |
| `STRIPE_WEBHOOK_SECRET` | criado no passo 3 (`whsec_...`) |

## 3. [VOCÊ] Configurar o webhook

1. Stripe → **Developers → Webhooks → Add endpoint**.
2. URL: `https://SEU_DOMINIO/api/stripe/webhook`
3. Eventos a escutar:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Salve e copie o **Signing secret** (`whsec_...`) → variável `STRIPE_WEBHOOK_SECRET`.

## 4. Redeploy

Após salvar as variáveis, faça **Redeploy** na Vercel. Pronto: o botão de assinar
passa a abrir o **checkout do Stripe**; ao pagar, o webhook ativa o plano
automaticamente.

## Como funciona

- **Assinar / Testar 7 dias** (`/planos`) → cria a sessão de checkout e redireciona
  ao Stripe. O trial de 7 dias é aplicado quando o usuário escolhe "Testar".
- **Webhook** (`/api/stripe/webhook`) → ao concluir o checkout ou mudar a
  assinatura, atualiza `tenant.plano`, `statusAssinatura` e a tabela
  `subscriptions` (com `paymentIdExterno` = id da assinatura no Stripe).
- **Gerenciar assinatura** (`/planos`, para quem já é Prime) → abre o **Billing
  Portal** do Stripe para trocar cartão, ver faturas ou cancelar. Cancelou? O
  webhook devolve o tenant para o Free.

## Teste (modo Test)

Use o cartão de teste `4242 4242 4242 4242`, validade futura e CVC qualquer.
Para receber webhooks em desenvolvimento local: `stripe listen --forward-to
localhost:3000/api/stripe/webhook` (Stripe CLI).
