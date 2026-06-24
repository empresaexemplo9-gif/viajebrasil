import { perfis, vagas } from '@/lib/dados';
import { vagasParaPerfil } from '@/lib/match';

export default function VagasPage() {
  // Demonstração do match: vagas ranqueadas para um candidato de exemplo.
  const candidato = perfis[0];
  const recomendadas = vagasParaPerfil(candidato, vagas);

  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Banco de Vagas e Talentos</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Empresas publicam vagas (CLT, PJ ou freela) e o sistema faz o <strong>match</strong> por
        habilidade, área e região.
      </p>

      <div className="mt-6 rounded-xl border border-marca-100 bg-marca-50 px-4 py-3 text-sm text-marca-800">
        Match calculado para o perfil de exemplo <strong>{candidato.nome}</strong> ·{' '}
        {candidato.areaAtuacao}
      </div>

      <div className="mt-6 grid gap-4">
        {recomendadas.map(({ vaga, pontuacao, habilidadesEmComum }) => (
          <div key={vaga.id} className="cartao">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-tinta">{vaga.titulo}</h3>
                  <span className="selo bg-slate-100 text-slate-600">{vaga.tipo}</span>
                </div>
                <p className="text-sm text-slate-500">
                  {vaga.empresa} · {vaga.area} · {vaga.regiao}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-marca-600">{pontuacao}%</div>
                <div className="text-xs font-semibold text-slate-400">de match</div>
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-600">{vaga.descricao}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {vaga.habilidades.map((h) => {
                const tem = habilidadesEmComum.includes(h);
                return (
                  <span
                    key={h}
                    className={`selo ${tem ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                  >
                    {h}
                  </span>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">{vaga.salario}</span>
              <button className="btn-primario !px-4 !py-2">Candidatar-se</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
