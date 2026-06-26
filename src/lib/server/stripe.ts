/**
 * Cliente Stripe (lazy) e mapeamento plano ↔ Price.
 *
 * Tudo é opcional: sem STRIPE_SECRET_KEY a plataforma segue funcionando com a
 * ativação direta de plano (modo demonstração). Com as chaves configuradas, a
 * assinatura passa por checkout/cobrança recorrente reais.
 *
 * Variáveis:
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
 *   STRIPE_PRICE_BASICO, STRIPE_PRICE_PRO, STRIPE_PRICE_ELITE
 */
import Stripe from 'stripe';
import type { ChavePlano } from '../planos';

let _stripe: Stripe | null = null;

export function stripeAtivo(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY ausente');
    _stripe = new Stripe(key);
  }
  return _stripe;
}

type ChavePaga = Exclude<ChavePlano, 'free'>;

const PRICE_POR_PLANO: Record<ChavePaga, string | undefined> = {
  basico: process.env.STRIPE_PRICE_BASICO,
  pro: process.env.STRIPE_PRICE_PRO,
  elite: process.env.STRIPE_PRICE_ELITE,
};

export function priceIdDe(chave: ChavePlano): string | null {
  if (chave === 'free') return null;
  return PRICE_POR_PLANO[chave] ?? null;
}

/** Descobre o plano a partir do Price (usado no webhook). */
export function planoDePriceId(priceId: string | null | undefined): ChavePlano {
  if (!priceId) return 'free';
  for (const chave of ['basico', 'pro', 'elite'] as ChavePaga[]) {
    if (PRICE_POR_PLANO[chave] === priceId) return chave;
  }
  return 'free';
}

export function urlBase(): string {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? '';
}
