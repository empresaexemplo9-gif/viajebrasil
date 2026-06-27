import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { listarGrupos, criarGrupo, entrarGrupo } from '@/lib/server/grupos';

export const metadata = { title: 'Grupos' };
export const dynamic = 'force-dynamic';

export default async function GruposPage() {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/grupos');

  async function criar(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    const id = await criarGrupo(a.userId, {
      nome: String(formData.get('nome') ?? '').trim() || 'Grupo',
      descricao: String(formData.get('descricao') ?? '').trim(),
      categoria: String(formData.get('categoria') ?? '').trim(),
    });
    redirect(`/painel/grupos/${id}`);
  }
  async function entrar(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    const id = String(formData.get('id') ?? '');
    await entrarGrupo(id, a.userId);
    redirect(`/painel/grupos/${id}`);
  }

  const grupos = await listarGrupos(ctx.userId);

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Grupos e comunidades</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Espaços por setor e região para trocar, indicar negócios e crescer junto.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {grupos.map((g) => (
          <div key={g.id} className="cartao flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-tinta">{g.nome}</h3>
              {g.categoria && <span className="selo bg-slate-100 text-slate-600">{g.categoria}</span>}
            </div>
            <p className="mt-1 flex-1 text-sm text-slate-600">{g.descricao || 'Sem descrição.'}</p>
            <p className="mt-2 text-xs text-slate-400">{g.membros} membro(s)</p>
            <div className="mt-3">
              {g.sou ? (
                <Link href={`/painel/grupos/${g.id}`} className="btn-primario w-full !py-2">
                  Abrir
                </Link>
              ) : (
                <form action={entrar}>
                  <input type="hidden" name="id" value={g.id} />
                  <button className="btn-secundario w-full !py-2">Entrar no grupo</button>
                </form>
              )}
            </div>
          </div>
        ))}
        {grupos.length === 0 && (
          <p className="cartao text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
            Nenhum grupo ainda. Crie o primeiro abaixo.
          </p>
        )}
      </div>

      <form action={criar} className="cartao mt-8 grid gap-4 sm:grid-cols-2">
        <h2 className="font-bold text-tinta sm:col-span-2">Criar grupo</h2>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Nome</span>
          <input name="nome" required className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Categoria (setor/região)</span>
          <input name="categoria" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-slate-500">Descrição</span>
          <textarea name="descricao" rows={2} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500" />
        </label>
        <div className="sm:col-span-2">
          <button className="btn-primario">Criar grupo</button>
        </div>
      </form>
    </div>
  );
}
