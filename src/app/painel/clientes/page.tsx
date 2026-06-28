import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { listarClientes, excluirCliente } from '@/lib/server/crm';

export const metadata = { title: 'Clientes' };
export const dynamic = 'force-dynamic';

export default async function ClientesPage() {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/clientes');

  async function remover(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await excluirCliente(a.tenantId, String(formData.get('id') ?? ''));
    redirect('/painel/clientes');
  }

  const clientes = await listarClientes(ctx.tenantId);
  const totalFechado = clientes.reduce((s, c) => {
    const n = Number(c.valor.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
    return s + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="container-app py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-tinta">Clientes</h1>
          <p className="mt-1 text-slate-600">
            Negócios fechados — cada lead movido para <strong>Ganho</strong> no{' '}
            <Link href="/painel/crm" className="font-semibold text-marca-600">CRM</Link> entra aqui automaticamente.
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-marca-600">{clientes.length}</div>
          <div className="text-xs font-semibold text-slate-400">clientes</div>
        </div>
      </div>

      {totalFechado > 0 && (
        <div className="cartao mt-6 inline-flex items-center gap-2">
          <span className="text-sm text-slate-500">Total fechado registrado:</span>
          <strong className="text-marca-700">
            {totalFechado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </strong>
        </div>
      )}

      {clientes.length === 0 ? (
        <div className="cartao mt-8 text-center text-slate-500">
          Ainda não há clientes. Feche um lead como <strong>Ganho</strong> no{' '}
          <Link href="/painel/crm" className="font-semibold text-marca-600">CRM</Link> para registrar o primeiro.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase text-slate-400">
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Contato</th>
                <th className="py-2 pr-3">Tipo</th>
                <th className="py-2 pr-3">Origem</th>
                <th className="py-2 pr-3">Valor</th>
                <th className="py-2 pr-3">Desde</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-3">
                    <p className="font-bold text-tinta">{c.nome}</p>
                    {c.descricao && <p className="text-xs text-slate-500">{c.descricao}</p>}
                  </td>
                  <td className="py-3 pr-3 text-slate-600">
                    {c.email && <p>{c.email}</p>}
                    {c.telefone && <p>{c.telefone}</p>}
                    {!c.email && !c.telefone && <span className="text-slate-400">—</span>}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="selo bg-marca-50 text-[11px] text-marca-700">{c.tipoRotulo}</span>
                  </td>
                  <td className="py-3 pr-3 text-slate-500">{c.origem || '—'}</td>
                  <td className="py-3 pr-3 font-semibold text-marca-700">{c.valor || '—'}</td>
                  <td className="py-3 pr-3 text-slate-500">{c.desde}</td>
                  <td className="py-3">
                    <form action={remover}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="text-[11px] font-semibold text-rose-600">excluir</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
