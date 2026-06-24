import { redirect } from 'next/navigation';
import { usuarioAtual } from '@/lib/sessao';
import { definirPreco, listarPlanos, precoFormatado, type ChavePlano } from '@/lib/planos';

export const metadata = { title: 'Admin · Tabela de preços' };

export default function AdminPlanosPage({
  searchParams,
}: {
  searchParams?: { salvo?: string };
}) {
  if (!usuarioAtual()) redirect('/entrar?proximo=/admin/planos');

  async function salvarPreco(formData: FormData) {
    'use server';
    if (!usuarioAtual()) redirect('/entrar');
    const chave = String(formData.get('plano') ?? '') as ChavePlano;
    const preco = Number(String(formData.get('preco') ?? '').replace(',', '.'));
    definirPreco(chave, preco);
    redirect('/admin/planos?salvo=1');
  }

  const planos = listarPlanos();

  return (
    <div className="container-app py-12">
      <span className="selo bg-slate-200 text-slate-700">Painel admin</span>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-tinta">Tabela de preços</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Ajuste os valores mensais dos planos Prime. As mudanças refletem na página de planos em
        tempo real. (Em memória nesta demonstração; vai para o banco na fase 2.)
      </p>

      {searchParams?.salvo && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          Preço atualizado.
        </p>
      )}

      <div className="mt-8 space-y-3">
        {planos.map((p) => (
          <div key={p.chave} className="cartao flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-tinta">{p.nome}</h2>
              <p className="text-xs text-slate-500">{p.alcance}</p>
            </div>

            {p.prime ? (
              <form action={salvarPreco} className="flex items-end gap-2">
                <input type="hidden" name="plano" value={p.chave} />
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-500">
                    Preço mensal (R$)
                  </span>
                  <input
                    name="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={p.preco}
                    className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-marca-500"
                  />
                </label>
                <button className="btn-primario !py-2">Salvar</button>
              </form>
            ) : (
              <span className="text-sm font-semibold text-slate-400">{precoFormatado(p)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
