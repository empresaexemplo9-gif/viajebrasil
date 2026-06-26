import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import {
  reuniaoDetalhe,
  responderConvite,
  adicionarParticipante,
  cancelarReuniao,
} from '@/lib/server/agenda';
import { SalaCall } from '@/components/SalaCall';

export const dynamic = 'force-dynamic';

const ROTULO: Record<string, string> = {
  reuniao: 'Reunião',
  negociacao: 'Negociação',
  apresentacao: 'Apresentação',
  entrevista: 'Entrevista',
};

function quando(d: Date): string {
  return d.toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' });
}

export default async function ReuniaoPage({ params }: { params: { id: string } }) {
  const ctx = await obterContexto();
  if (!ctx) redirect(`/entrar?proximo=/painel/agenda/${params.id}`);

  const r = await reuniaoDetalhe(params.id, ctx.userId, ctx.email ?? '');
  if (!r) notFound();

  async function responder(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    await responderConvite(params.id, atual.userId, atual.email ?? '', String(formData.get('aceitar')) === '1');
    redirect(`/painel/agenda/${params.id}`);
  }

  async function convidar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    await adicionarParticipante(params.id, atual.userId, String(formData.get('email') ?? ''));
    redirect(`/painel/agenda/${params.id}`);
  }

  async function cancelar() {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    await cancelarReuniao(params.id, atual.userId);
    redirect('/painel/agenda');
  }

  return (
    <div className="container-app py-10">
      <Link href="/painel/agenda" className="text-sm font-semibold text-marca-600">
        ← Agenda
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="selo bg-marca-100 text-marca-700">{ROTULO[r.tipo] ?? r.tipo}</span>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-tinta">{r.titulo}</h1>
          <p className="text-slate-500">
            {quando(r.inicioEm)} · {r.duracaoMin} min · organiza {r.organizador}
          </p>
        </div>
        {r.souOrganizador && (
          <form action={cancelar}>
            <button className="btn-secundario !py-2 !text-rose-600">Cancelar compromisso</button>
          </form>
        )}
      </div>

      {r.descricao && <p className="mt-4 max-w-2xl whitespace-pre-line text-slate-700">{r.descricao}</p>}

      {/* Sala de call ou convite */}
      <div className="mt-6">
        {r.acesso ? (
          <SalaCall sala={r.sala} nome={ctx.nome ?? 'Participante'} />
        ) : r.meuStatus === 'convidado' ? (
          <div className="cartao max-w-lg">
            <h2 className="font-bold text-tinta">Você foi convidado</h2>
            <p className="mt-1 text-sm text-slate-600">
              Aceite para liberar o acesso à sala de call.
            </p>
            <div className="mt-4 flex gap-2">
              <form action={responder}>
                <button name="aceitar" value="1" className="btn-primario">
                  Aceitar e entrar
                </button>
              </form>
              <form action={responder}>
                <button name="aceitar" value="0" className="btn-secundario">
                  Recusar
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="cartao max-w-lg text-sm text-slate-600">
            Você {r.meuStatus === 'recusado' ? 'recusou este convite' : 'não faz parte deste compromisso'}.
          </div>
        )}
      </div>

      {/* Participantes */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-tinta">Participantes</h2>
        <div className="mt-3 space-y-2">
          {r.participantes.map((p) => (
            <div key={p.email} className="cartao flex items-center justify-between gap-3 !py-3">
              <div>
                <p className="font-semibold text-tinta">
                  {p.nome} {p.organizador && <span className="text-xs text-marca-600">(organizador)</span>}
                </p>
                <p className="text-xs text-slate-500">{p.email}</p>
              </div>
              <span
                className={`selo ${
                  p.status === 'aceito'
                    ? 'bg-emerald-100 text-emerald-700'
                    : p.status === 'recusado'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-500'
                }`}
              >
                {p.status}
              </span>
            </div>
          ))}
        </div>

        {r.souOrganizador && (
          <form action={convidar} className="mt-4 flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">Convidar mais alguém (e-mail)</span>
              <input
                name="email"
                type="email"
                required
                className="w-72 max-w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-500"
              />
            </label>
            <button className="btn-secundario !py-2">Convidar</button>
          </form>
        )}
      </section>
    </div>
  );
}
