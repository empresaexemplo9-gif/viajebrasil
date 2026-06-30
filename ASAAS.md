# Pagamentos com Asaas

A assinatura dos planos Prime usa o **Asaas**. Quando `ASAAS_API_KEY` está
definido, a página de planos leva ao checkout do Asaas (link de pagamento
recorrente mensal). Sem a chave, assinar apenas troca o plano (modo demonstração).

## 1. Variáveis de ambiente (Vercel)

| Variável | Descrição |
| --- | --- |
| `ASAAS_API_KEY` | Chave de API do Asaas (Configurações → Integrações → API). |
| `ASAAS_AMBIENTE` | `producao` (padrão) ou `sandbox`. |
| `ASAAS_WEBHOOK_TOKEN` | Token que valida os webhooks. Defina um valor secreto e use o mesmo no painel do Asaas. |

Após alterar variáveis, faça um novo deploy.

## 2. Webhook (obrigatório para ativar o plano após o pagamento)

No painel do Asaas, em **Configurações → Webhooks**, adicione:

- **URL:** `https://SEU_DOMINIO/api/asaas/webhook`
- **Token de autenticação:** o mesmo valor de `ASAAS_WEBHOOK_TOKEN`
- **Versão da fila:** sincrona ou assíncrona (tanto faz)
- **Eventos:** pelo menos
  - `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED` → ativa o plano
  - `PAYMENT_OVERDUE` → marca inadimplente
  - `PAYMENT_REFUNDED`, `PAYMENT_DELETED`, `PAYMENT_CHARGEBACK_REQUESTED`, `SUBSCRIPTION_DELETED` → cancela (volta para Free)

## Como funciona

1. O usuário clica em **Assinar agora** num plano Prime.
2. O app cria um **link de pagamento recorrente** no Asaas (mensal, valor do plano)
   com `externalReference = "<tenantId>:<chave>"` e redireciona para a página do Asaas.
3. O cliente paga (PIX, boleto ou cartão) na página do Asaas.
4. O Asaas chama o webhook; o app ativa o plano do negócio (tenant) e registra a
   assinatura.

> **Observação:** o botão "Testar 7 dias grátis" ativa o plano direto, sem
> cobrança (período de avaliação). A cobrança real ocorre em "Assinar agora".
