/**
 * Webhook do Stripe — fonte de verdade do estado das assinaturas.
 * Verifica a assinatura do payload (corpo cru) e processa o evento.
 *
 * Configure no Stripe: Developers → Webhooks → endpoint
 *   https://SEU_DOMINIO/api/stripe/webhook
 * Eventos: checkout.session.completed, customer.subscription.*
 */
import { NextResponse } from 'next/server';
import { getStripe, stripeAtivo } from '@/lib/server/stripe';
import { processarEventoStripe } from '@/lib/server/assinatura';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!stripeAtivo()) {
    return NextResponse.json({ erro: 'Stripe não configurado' }, { status: 503 });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get('stripe-signature');
  if (!secret || !sig) {
    return NextResponse.json({ erro: 'Assinatura ausente' }, { status: 400 });
  }

  const corpo = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(corpo, sig, secret);
  } catch (e) {
    return NextResponse.json(
      { erro: `Assinatura inválida: ${(e as Error).message}` },
      { status: 400 },
    );
  }

  try {
    await processarEventoStripe(event);
  } catch (e) {
    console.error('Erro ao processar webhook Stripe:', e);
    // 200 mesmo assim evita retries infinitos; o erro fica no log.
  }
  return NextResponse.json({ received: true });
}
