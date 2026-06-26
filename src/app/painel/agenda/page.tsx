import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import {
  criarReuniao,
  minhasReunioes,
  responderConvite,
  type TipoCompromisso,
} from '@/lib/server/agenda';

export const metadata = { title: 'Agenda' };
export const dynamic = 'force-dynamic';

const TIPOS: { v: TipoCompromisso; r: string }[] = [
  { v: 'reuniao', r: 'Reunião' },
  { v: 'negociacao', r: 'Negociação' },
  { v: 'apresentacao', r: 'Apresentação' },
  { v: 'entrevista', r: 'Entrevista' },
];
const ROTULO: Record<string, string> = Object.fromEntries(TIPOS.map((t) => [t.v, t.r]));

function quando(d: Date): string {
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams?: { ok?: string };
}) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/agenda');

  async function agendar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    const inicioStr = String(formData.get('inicioEm') ?? '');
    const inicioEm = inicioStr ? new Date(inicioStr) : new Date(Date.now() + 3600_000);
    const emails = String(formData.get('participantes') ?? '')
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const id = await criarReuniao(
      { id: atual.userId, tenantId: atual.tenantId, email: atual.email },
      {
        titulo: String(formData.get('titulo') ?? '').trim() || 'Compromisso',
        tipo: String(formData.get('tipo') ?? 'reuniao') as TipoCompromisso,
        descricao: String(formData.get('descricao') ?? '').trim(),
        inicioEm: isNaN(inicioEm.getTime()) ? new Date(Date.now() + 3600_000) : inicioEm,
        duracaoMin: Number(formData.get('duracaoMin') ?? 30) || 30,
      },
      emails,
    );
    redirect(`/painel/agenda/${id}`);
  }

  async function responder(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar');
    await responderConvite(
      String(formData.get('id') ?? ''),
      atual.userId,
      atual.email ?? '',
      String(formData.get('aceitar') ?? '') === '1',
    );
    redirect('/painel/agenda');
  }

  const reunioes = await minhasReunioes(ctx.userId, ctx.email ?? '');
  const convites = reunioes.filter((r) => !r.souOrganizador && r.meuStatus === 'convidado');
  const agenda = reunioes.filter((r) => r.souOrganizador || r.meuStatus === 'aceito');

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Agenda</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Agende reuniões, negociações, apresentações e entrevistas com sala de call. Quem aceitar o
        convite entra na call — sem burocracia.
      </p>

      {/* Convites pendentes */}
      {convites.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-black text-tinta">Convites pendentes</h2>
          <div className="mt-3 space-y-3">
            {convites.map((r) => (
              <div key={r.id} className="cartao flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="selo bg-marca-100 text-marca-700">{ROTULO[r.tipo] ?? r.tipo}</span>
                  <h3 className="mt-1 font-bold text-tinta">{r.titulo}</h3>
                  <p className="text-xs text-slate-500">
                    {quando(r.inicioEm)} · por {r.organizador}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={responder}>
                    <input type="hidden" name="id" value={r.id} />
                    <button name="aceitar" value="1" className="btn-primario !py-2">
                      Aceitar
                    </button>
                  </form>
                  <form action={responder}>
                    <input type="hidden" name="id" value={r.id} />
                    <button name="aceitar" value="0" className="btn-secundario !py-2">
                      Recusar
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Minha agenda */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-tinta">Meus compromissos</h2>
        <div className="mt-3 space-y-3">
          {agenda.length === 0 && (
            <p className="cartao text-sm text-slate-500">Nada agendado ainda. Crie abaixo.</p>
          )}
          {agenda.map((r) => (
            <Link
              key={r.id}
              href={`/painel/agenda/${r.id}`}
              className="cartao flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <span className="selo bg-slate-100 text-slate-600">{ROTULO[r.tipo] ?? r.tipo}</span>
                <h3 className="mt-1 font-bold text-tinta">{r.titulo}</h3>
                <p className="text-xs text-slate-500">
                  {quando(r.inicioEm)} · {r.duracaoMin} min · {r.totalParticipantes} participante(s)
                  {r.souOrganizador ? ' · você organiza' : ''}
                </p>
              </div>
              <span className="text-sm font-semibold text-marca-600">Abrir →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Agendar */}
      <form action={agendar} className="cartao mt-10 grid gap-4 sm:grid-cols-2">
        <h2 className="font-bold text-tinta sm:col-span-2">Agendar compromisso</h2>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Título</span>
          <input name="titulo" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Tipo</span>
          <select name="tipo" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
            {TIPOS.map((t) => (
              <option key={t.v} value={t.v}>
                {t.r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Duração (min)</span>
          <input name="duracaoMin" type="number" min={10} defaultValue={30} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Data e hora</span>
          <input name="inicioEm" type="datetime-local" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Participantes (e-mails, separados por vírgula ou linha)
          </span>
          <textarea name="participantes" rows={2} placeholder="fulano@email.com, ciclana@email.com" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Descrição (opcional)</span>
          <textarea name="descricao" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <div className="sm:col-span-2">
          <button className="btn-primario">Agendar e criar sala</button>
        </div>
      </form>
    </div>
  );
}
