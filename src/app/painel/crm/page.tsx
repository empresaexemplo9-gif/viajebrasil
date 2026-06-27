import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { listarLeads, criarLead, moverLead, excluirLead, ETAPAS, type Etapa } from '@/lib/server/crm';

export const metadata = { title: 'CRM' };
export const dynamic = 'force-dynamic';

export default async function CrmPage({ searchParams }: { searchParams?: { ok?: string } }) {
  const ctx = await obterContexto();
  if (!ctx) redirect('/entrar?proximo=/painel/crm');

  async function adicionar(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await criarLead(a.tenantId, a.userId, {
      nome: String(formData.get('nome') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      telefone: String(formData.get('telefone') ?? '').trim(),
      origem: String(formData.get('origem') ?? '').trim(),
      valor: String(formData.get('valor') ?? ''),
      notas: String(formData.get('notas') ?? '').trim(),
    });
    redirect('/painel/crm?ok=1');
  }
  async function mover(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await moverLead(a.tenantId, String(formData.get('id') ?? ''), String(formData.get('etapa')) as Etapa);
    redirect('/painel/crm');
  }
  async function remover(formData: FormData) {
    'use server';
    const a = await obterContexto();
    if (!a) redirect('/entrar');
    await excluirLead(a.tenantId, String(formData.get('id') ?? ''));
    redirect('/painel/crm');
  }

  const leads = await listarLeads(ctx.tenantId);
  const porEtapa = (e: Etapa) => leads.filter((l) => l.etapa === e);

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">CRM — funil de leads</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Cadastre leads/contatos e mova pelo funil até fechar. Tudo do seu negócio, isolado.
      </p>

      {searchParams?.ok && (
        <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">Lead adicionado.</p>
      )}

      {/* Funil (kanban) */}
      <div className="mt-6 grid gap-3 lg:grid-cols-5 sm:grid-cols-2">
        {ETAPAS.map((et) => {
          const itens = porEtapa(et.v);
          return (
            <div key={et.v} className="rounded-xl bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-black text-tinta">{et.r}</h2>
                <span className="text-xs font-semibold text-slate-400">{itens.length}</span>
              </div>
              <div className="space-y-2">
                {itens.map((l) => (
                  <div key={l.id} className="cartao !p-3">
                    <p className="font-bold text-tinta">{l.nome}</p>
                    {l.valor && <p className="text-xs font-semibold text-marca-600">{l.valor}</p>}
                    {(l.email || l.telefone) && (
                      <p className="text-xs text-slate-500">{l.email || l.telefone}</p>
                    )}
                    {l.origem && <p className="text-[11px] text-slate-400">via {l.origem}</p>}
                    {l.notas && <p className="mt-1 text-xs text-slate-600">{l.notas}</p>}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <form action={mover} className="flex items-center gap-1">
                        <input type="hidden" name="id" value={l.id} />
                        <select
                          name="etapa"
                          defaultValue={l.etapa}
                          className="rounded border border-slate-300 px-1 py-0.5 text-[11px]"
                        >
                          {ETAPAS.map((e) => (
                            <option key={e.v} value={e.v}>
                              {e.r}
                            </option>
                          ))}
                        </select>
                        <button className="text-[11px] font-semibold text-marca-600">mover</button>
                      </form>
                      <form action={remover}>
                        <input type="hidden" name="id" value={l.id} />
                        <button className="text-[11px] font-semibold text-rose-600">excluir</button>
                      </form>
                    </div>
                  </div>
                ))}
                {itens.length === 0 && <p className="px-1 text-xs text-slate-400">—</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Adicionar lead */}
      <form action={adicionar} className="cartao mt-8 grid gap-4 sm:grid-cols-2">
        <h2 className="font-bold text-tinta sm:col-span-2">Adicionar lead</h2>
        <Campo nome="nome" rotulo="Nome" obrig />
        <Campo nome="email" rotulo="E-mail" tipo="email" />
        <Campo nome="telefone" rotulo="Telefone" />
        <Campo nome="origem" rotulo="Origem (ex.: Instagram, indicação)" />
        <Campo nome="valor" rotulo="Valor potencial (R$)" />
        <Campo nome="notas" rotulo="Notas" />
        <div className="sm:col-span-2">
          <button className="btn-primario">Adicionar ao funil</button>
        </div>
      </form>
    </div>
  );
}

function Campo({ nome, rotulo, tipo = 'text', obrig = false }: { nome: string; rotulo: string; tipo?: string; obrig?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-500">{rotulo}</span>
      <input
        name={nome}
        type={tipo}
        required={obrig}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
      />
    </label>
  );
}
