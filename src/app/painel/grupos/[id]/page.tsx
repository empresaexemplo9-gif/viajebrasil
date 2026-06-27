import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { grupoDetalhe, entrarGrupo, sairGrupo, postarNoGrupo } from '@/lib/server/grupos';

export const dynamic = 'force-dynamic';

function quando(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default async function GrupoPage({ params }: { params: { id: string } }) {
  const ctx = await obterContexto();
  if (!ctx) redirect(`/entrar?proximo=/painel/grupos/${params.id}`);

  const g = await grupoDetalhe(params.id, ctx.userId);
  if (!g) notFound();

  async function entrar() {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await entrarGrupo(params.id, a.userId);
    redirect(`/painel/grupos/${params.id}`);
  }
  async function sair() {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await sairGrupo(params.id, a.userId);
    redirect('/painel/grupos');
  }
  async function postar(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await postarNoGrupo(params.id, a.userId, String(formData.get('texto') ?? ''));
    redirect(`/painel/grupos/${params.id}`);
  }

  return (
    <div className="container-app py-10">
      <Link href="/painel/grupos" className="text-sm font-semibold text-marca-600">
        ← Grupos
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-tinta">{g.nome}</h1>
          {g.categoria && <span className="selo mt-1 bg-slate-100 text-slate-600">{g.categoria}</span>}
          {g.descricao && <p className="mt-2 max-w-2xl text-slate-600">{g.descricao}</p>}
        </div>
        {g.sou ? (
          <form action={sair}>
            <button className="btn-secundario !py-2 !text-rose-600">Sair do grupo</button>
          </form>
        ) : (
          <form action={entrar}>
            <button className="btn-primario !py-2">Entrar no grupo</button>
          </form>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Mural */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-black text-tinta">Mural</h2>
          {g.sou ? (
            <form action={postar} className="cartao mt-3 space-y-2">
              <textarea
                name="texto"
                rows={2}
                required
                placeholder="Escreva no grupo…"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
              />
              <button className="btn-primario !py-2">Publicar</button>
            </form>
          ) : (
            <p className="cartao mt-3 text-sm text-slate-500">Entre no grupo para participar do mural.</p>
          )}

          <div className="mt-4 space-y-3">
            {g.mensagens.map((m) => (
              <div key={m.id} className="cartao !py-3">
                <div className="flex items-center justify-between">
                  <Link href={`/perfil/${m.autorId}`} className="text-sm font-bold text-tinta hover:text-marca-700">
                    {m.autor}
                  </Link>
                  <span className="text-xs text-slate-400">{quando(m.criadoEm)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{m.texto}</p>
              </div>
            ))}
            {g.mensagens.length === 0 && <p className="text-sm text-slate-400">Sem mensagens ainda.</p>}
          </div>
        </div>

        {/* Membros */}
        <div>
          <h2 className="text-lg font-black text-tinta">Membros ({g.membros.length})</h2>
          <div className="mt-3 space-y-1">
            {g.membros.map((m) => (
              <Link key={m.id} href={`/perfil/${m.id}`} className="block rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
                {m.nome}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
