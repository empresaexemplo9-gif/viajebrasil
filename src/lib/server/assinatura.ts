/**
 * Serviço de assinatura via Stripe: checkout, portal de gerenciamento e
 * sincronização por webhook (fonte de verdade do estado do plano).
 *
 * O webhook roda sem sessão (chamada do Stripe), então usa `prisma` direto.
 */
import type Stripe from 'stripe';
import { prisma } from './prisma';
import { getStripe, priceIdDe, planoDePriceId, urlBase } from './stripe';
import { obterPlano, paraPlanoDb, type ChavePlano } from '../planos';

const TRIAL_DIAS = 7;

/**
 * Item da assinatura: usa o Price configurado (STRIPE_PRICE_*) se houver; senão
 * gera o preço na hora a partir dos valores da plataforma — assim não é preciso
 * cadastrar produtos no Stripe manualmente.
 */
function construirLineItem(chave: ChavePlano): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = priceIdDe(chave);
  if (priceId) return { price: priceId, quantity: 1 };
  const plano = obterPlano(chave);
  return {
    quantity: 1,
    price_data: {
      currency: 'brl',
      product_data: { name: `DRAP ${plano.nome}` },
      unit_amount: Math.round(plano.preco * 100),
      recurring: { interval: 'month' },
    },
  };
}

/** Garante (e persiste) o Customer do Stripe para o tenant. */
export async function garantirCustomer(tenantId: string, email?: string | null): Promise<string> {
  const t = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!t) throw new Error('Tenant não encontrado');
  if (t.stripeCustomerId) return t.stripeCustomerId;
  const cust = await getStripe().customers.create({
    name: t.nome,
    email: email ?? undefined,
    metadata: { tenantId },
  });
  await prisma.tenant.update({ where: { id: tenantId }, data: { stripeCustomerId: cust.id } });
  return cust.id;
}

/** Cria a sessão de checkout (assinatura recorrente) e devolve a URL. */
export async function criarCheckout(opts: {
  tenantId: string;
  email?: string | null;
  chave: ChavePlano;
  trial: boolean;
}): Promise<string> {
  if (opts.chave === 'free') throw new Error('Plano Free não passa por checkout');
  const customer = await garantirCustomer(opts.tenantId, opts.email);
  const base = urlBase();
  const subData: Stripe.Checkout.SessionCreateParams.SubscriptionData = {
    metadata: { tenantId: opts.tenantId, chave: opts.chave },
  };
  if (opts.trial) subData.trial_period_days = TRIAL_DIAS;
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    customer,
    line_items: [construirLineItem(opts.chave)],
    subscription_data: subData,
    success_url: `${base}/painel/prime?ok=assinado`,
    cancel_url: `${base}/planos`,
    allow_promotion_codes: true,
    metadata: { tenantId: opts.tenantId, chave: opts.chave },
  });
  if (!session.url) throw new Error('Stripe não retornou URL de checkout');
  return session.url;
}

/** Cria a sessão do portal de cobrança (gerenciar/cancelar) e devolve a URL. */
export async function criarPortal(tenantId: string): Promise<string> {
  const customer = await garantirCustomer(tenantId);
  const session = await getStripe().billingPortal.sessions.create({
    customer,
    return_url: `${urlBase()}/painel`,
  });
  return session.url;
}

function mapStatus(s: Stripe.Subscription.Status): 'trial' | 'ativa' | 'inadimplente' | 'cancelada' {
  switch (s) {
    case 'trialing':
      return 'trial';
    case 'active':
      return 'ativa';
    case 'past_due':
    case 'unpaid':
    case 'incomplete':
      return 'inadimplente';
    default:
      return 'cancelada';
  }
}

/** Aplica o estado de uma assinatura do Stripe ao tenant + tabela subscriptions. */
async function sincronizarAssinatura(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
  const tenant = await prisma.tenant.findFirst({ where: { stripeCustomerId: customerId } });
  if (!tenant) return;

  // Plano: prioriza o metadata gravado na assinatura; cai no mapa de Price IDs.
  const chaveMeta = sub.metadata?.chave as ChavePlano | undefined;
  const chave = chaveMeta ?? planoDePriceId(sub.items.data[0]?.price.id);
  const ativo = sub.status === 'active' || sub.status === 'trialing';
  const statusDb = mapStatus(sub.status);
  const renovaEm = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: { plano: paraPlanoDb(ativo ? chave : 'free'), statusAssinatura: statusDb },
  });

  const existente = await prisma.subscription.findFirst({ where: { paymentIdExterno: sub.id } });
  if (existente) {
    await prisma.subscription.update({
      where: { id: existente.id },
      data: { plano: paraPlanoDb(chave), status: statusDb, renovaEm },
    });
  } else {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plano: paraPlanoDb(chave),
        status: statusDb,
        gateway: 'stripe',
        paymentIdExterno: sub.id,
        renovaEm,
      },
    });
  }
}

/** Processa um evento do webhook do Stripe. */
export async function processarEventoStripe(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.subscription) {
        const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription.id;
        const sub = await getStripe().subscriptions.retrieve(subId);
        await sincronizarAssinatura(sub);
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await sincronizarAssinatura(event.data.object as Stripe.Subscription);
      break;
    default:
      // Outros eventos (invoice.*) podem ser tratados depois.
      break;
  }
}
