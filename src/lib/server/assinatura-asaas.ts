/**
 * Assinatura via Asaas: cria um link de pagamento recorrente (mensal) para o
 * plano escolhido e processa os webhooks que confirmam/cancelam o pagamento.
 *
 * Estratégia: usamos "payment link" (chargeType RECURRENT) — o cliente preenche
 * os próprios dados (CPF/CNPJ, forma de pagamento) na página hospedada pelo
 * Asaas, sem precisarmos coletar isso aqui. O vínculo com o tenant viaja no
 * campo `externalReference` ("<tenantId>:<chave>") e volta nos webhooks.
 *
 * O webhook roda sem sessão, então usa `prisma` direto (não withTenant).
 */
import { prisma } from './prisma';
import { asaasFetch } from './asaas';
import { obterPlano, paraPlanoDb, ORDEM, type ChavePlano } from '../planos';

/** URL pública base (para o retorno após o pagamento). */
function urlBase(): string {
  return process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? '';
}

type ChavePaga = Exclude<ChavePlano, 'free'>;

/** Cria o link de pagamento recorrente do plano e devolve a URL para redirect. */
export async function criarCheckoutAsaas(opts: {
  tenantId: string;
  chave: ChavePaga;
}): Promise<string> {
  const plano = obterPlano(opts.chave);
  const base = urlBase();

  const link = await asaasFetch<{ id: string; url?: string }>('/paymentLinks', {
    method: 'POST',
    body: {
      name: `DRAP ${plano.nome}`,
      description: `Assinatura mensal do plano ${plano.nome} na DRAP Business.`,
      billingType: 'UNDEFINED', // o cliente escolhe: PIX, boleto ou cartão
      chargeType: 'RECURRENT',
      subscriptionCycle: 'MONTHLY',
      value: plano.preco,
      externalReference: `${opts.tenantId}:${opts.chave}`,
      dueDateLimitDays: 7,
      notificationEnabled: true,
      ...(base ? { callback: { successUrl: `${base}/painel/prime?ok=assinado`, autoRedirect: true } } : {}),
    },
  });

  if (!link?.url) throw new Error('Asaas não retornou a URL do link de pagamento.');
  return link.url;
}

// ───────────────────────── Webhook ─────────────────────────

interface PagamentoAsaas {
  id?: string;
  subscription?: string;
  externalReference?: string | null;
  dueDate?: string;
  status?: string;
}
interface EventoAsaas {
  event: string;
  payment?: PagamentoAsaas;
  subscription?: { externalReference?: string | null };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Extrai (tenantId, chave) válidos do externalReference "<tenantId>:<chave>". */
function lerReferencia(ref?: string | null): { tenantId: string; chave: ChavePaga } | null {
  if (!ref) return null;
  const [tenantId, chave] = ref.split(':');
  if (!UUID_RE.test(tenantId)) return null;
  if (!ORDEM.includes(chave as ChavePlano) || chave === 'free') return null;
  return { tenantId, chave: chave as ChavePaga };
}

/**
 * Resolve o externalReference do evento. Eventos de pagamento podem não trazê-lo
 * diretamente — nesse caso, buscamos a assinatura no Asaas para obtê-lo.
 */
async function resolverRef(ev: EventoAsaas): Promise<string | null | undefined> {
  const direto = ev.payment?.externalReference ?? ev.subscription?.externalReference;
  if (direto) return direto;
  const subId = ev.payment?.subscription;
  if (!subId) return null;
  try {
    const sub = await asaasFetch<{ externalReference?: string | null }>(`/subscriptions/${subId}`);
    return sub?.externalReference;
  } catch {
    return null;
  }
}

/** Ativa o plano do tenant e registra/atualiza a assinatura. */
async function ativar(ev: EventoAsaas): Promise<void> {
  const dados = lerReferencia(await resolverRef(ev));
  if (!dados) return;
  const planoDb = paraPlanoDb(dados.chave);
  const idExterno = ev.payment?.subscription ?? ev.payment?.id ?? null;
  const renovaEm = new Date(Date.now() + 31 * 864e5);

  await prisma.tenant.update({
    where: { id: dados.tenantId },
    data: { plano: planoDb, statusAssinatura: 'ativa' },
  });

  const existente = idExterno
    ? await prisma.subscription.findFirst({ where: { paymentIdExterno: idExterno } })
    : null;

  if (existente) {
    await prisma.subscription.update({
      where: { id: existente.id },
      data: { plano: planoDb, status: 'ativa', renovaEm },
    });
  } else {
    await prisma.subscription.create({
      data: {
        tenantId: dados.tenantId,
        plano: planoDb,
        status: 'ativa',
        gateway: 'asaas',
        paymentIdExterno: idExterno,
        renovaEm,
      },
    });
  }
}

/** Marca a assinatura como inadimplente (sem rebaixar o plano de imediato). */
async function marcarInadimplente(ev: EventoAsaas): Promise<void> {
  const dados = lerReferencia(await resolverRef(ev));
  if (!dados) return;
  await prisma.tenant.update({
    where: { id: dados.tenantId },
    data: { statusAssinatura: 'inadimplente' },
  });
}

/** Cancela: volta o tenant para o plano Free. */
async function cancelar(ev: EventoAsaas): Promise<void> {
  const dados = lerReferencia(await resolverRef(ev));
  if (!dados) return;
  await prisma.tenant.update({
    where: { id: dados.tenantId },
    data: { plano: 'free', statusAssinatura: 'cancelada' },
  });
}

/** Processa um evento de webhook do Asaas. */
export async function processarEventoAsaas(ev: EventoAsaas): Promise<void> {
  switch (ev.event) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      await ativar(ev);
      break;
    case 'PAYMENT_OVERDUE':
      await marcarInadimplente(ev);
      break;
    case 'PAYMENT_REFUNDED':
    case 'PAYMENT_DELETED':
    case 'PAYMENT_CHARGEBACK_REQUESTED':
    case 'SUBSCRIPTION_DELETED':
      await cancelar(ev);
      break;
    default:
      // Demais eventos podem ser tratados depois.
      break;
  }
}
