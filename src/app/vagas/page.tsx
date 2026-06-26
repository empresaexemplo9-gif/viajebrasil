import Link from 'next/link';
import { listarVagasPublicas } from '@/lib/server/repos';

export const metadata = { title: 'Banco de Vagas' };
export const dynamic = 'force-dynamic';

export default async function VagasPage({
  searchParams,
}: {
  searchParams?: { q?: string; area?: string; regiao?: string; contrato?: string };
}) {
  const sp = searchParams ?? {};
  const vagas = await listarVagasPublicas({
    q: sp.q,
    area: sp.area,
    regiao: sp.regiao,
    tipoContrato: sp.contrato,
  });

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Banco de Vagas e Talentos</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Vagas abertas publicadas pelas empresas da plataforma. Ao se candidatar, a{' '}
        <strong>IA classifica seu currículo</strong> por aderência, experiência, certificações e
        referências.
      </p>

      {/* Filtros */}
      <form method="get" className="cartao mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder="Buscar vaga, habilidade…"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500 lg:col-span-2"
        />
        <select name="contrato" defaultValue={sp.contrato ?? ''} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          <option value="">Qualquer contrato</option>
          <option value="CLT">CLT</option>
          <option value="PJ">PJ</option>
          <option value="FREELA">Freela</option>
          <option value="TEMPORARIO">Temporário</option>
        </select>
        <input
          name="area"
          defaultValue={sp.area ?? ''}
          placeholder="Área"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
        />
        <input
          name="regiao"
          defaultValue={sp.regiao ?? ''}
          placeholder="Região"
          className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
        />
        <div className="sm:col-span-2 lg:col-span-5">
          <button className="btn-primario">Filtrar</button>
          {(sp.q || sp.area || sp.regiao || sp.contrato) && (
            <Link href="/vagas" className="btn-secundario ml-2">
              Limpar
            </Link>
          )}
        </div>
      </form>

      {vagas.length === 0 ? (
        <div className="cartao mt-8 text-center text-slate-500">
          Ainda não há vagas abertas.{' '}
          <Link href="/painel/vagas" className="font-semibold text-marca-600">
            Publique a primeira →
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {vagas.map((v) => (
            <div key={v.id} className="cartao">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-tinta">{v.titulo}</h3>
                    <span className="selo bg-slate-100 capitalize text-slate-600">
                      {v.tipoContrato} · {v.nivel}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {v.empresa} · {v.area} · {v.regiao}
                  </p>
                </div>
                <Link href={`/vagas/${v.id}`} className="btn-primario !px-4 !py-2">
                  Ver e candidatar
                </Link>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{v.descricao}</p>

              {v.habilidades.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {v.habilidades.map((h) => (
                    <span key={h} className="selo bg-marca-50 text-marca-700">
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
