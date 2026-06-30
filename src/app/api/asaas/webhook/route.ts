/**
 * Webhook do Asaas. Configure no painel do Asaas a URL:
 *   https://SEU_DOMINIO/api/asaas/webhook
 * e o mesmo token definido em ASAAS_WEBHOOK_TOKEN (enviado no header
 * `asaas-access-token`). É a fonte de verdade do estado da assinatura.
 */
import { NextResponse } from 'next/server';
import { processarEventoAsaas } from '@/lib/server/assinatura-asaas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Validação do token (quando configurado).
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (tokenEsperado && req.headers.get('asaas-access-token') !== tokenEsperado) {
    return NextResponse.json({ erro: 'Token inválido.' }, { status: 401 });
  }

  const evento = await req.json().catch(() => null);
  if (!evento?.event) {
    return NextResponse.json({ ok: true }); // nada a fazer
  }

  try {
    await processarEventoAsaas(evento);
  } catch (e) {
    console.error('Webhook Asaas:', (e as Error).message);
    // 500 faz o Asaas reentregar o evento mais tarde.
    return NextResponse.json({ erro: 'Falha ao processar evento.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
