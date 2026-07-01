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
import { prisma } from '@/lib/server/prisma';

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

  // Idempotência: registra o id do evento antes de processar. Se já existe,
  // é um replay/entrega duplicada → ignora sem reprocessar.
  const eventoId = `stripe_${event.id}`;
  try {
    await prisma.webhookEvent.create({ data: { id: eventoId } });
  } catch {
    // Violação de unique (ou indisponibilidade): trata como já processado.
    return NextResponse.json({ received: true, duplicado: true });
  }

  try {
    await processarEventoStripe(event);
  } catch (e) {
    console.error('Erro ao processar webhook Stripe:', e);
    // Falha real: apaga a marca para permitir reprocessamento e devolve 5xx,
    // para o Stripe reenviar o evento.
    await prisma.webhookEvent.deleteMany({ where: { id: eventoId } }).catch(() => {});
    return NextResponse.json({ erro: 'Falha ao processar evento' }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
