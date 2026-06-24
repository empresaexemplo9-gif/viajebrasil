import { perfis } from '@/lib/dados';

const tipos = [
  { tipo: 'Pessoa física', desc: 'Profissionais e colaboradores em busca de oportunidades e conexões.' },
  { tipo: 'Empresa', desc: 'Negócios que contratam, vendem e buscam parceiros comerciais.' },
  { tipo: 'Autônomo', desc: 'Freelancers e prestadores de serviço independentes.' },
  { tipo: 'Produto / Serviço', desc: 'Catálogo público com preço, prazo e região de atendimento.' },
];

export default function PerfilPage() {
  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Perfil Unificado</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Um cadastro único para qualquer tipo de conta. Quanto mais completo e ativo, maior o
        <strong> score</strong> — e melhor o posicionamento nas buscas.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tipos.map((t) => (
          <div key={t.tipo} className="cartao">
            <h3 className="font-bold text-marca-700">{t.tipo}</h3>
            <p className="mt-1 text-sm text-slate-600">{t.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-xl font-black text-tinta">Perfis na rede</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {perfis.map((p) => (
          <div key={p.id} className="cartao">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-tinta">{p.nome}</h3>
                <p className="text-sm text-slate-500">
                  {p.areaAtuacao} · {p.regiao}
                </p>
              </div>
              <span className="selo bg-marca-50 capitalize text-marca-700">{p.tipo}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{p.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {p.habilidades.map((h) => (
                <span key={h} className="selo bg-slate-100 text-slate-600">
                  {h}
                </span>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Score do perfil</span>
                <span className="text-marca-700">{p.score}/100</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-marca-600" style={{ width: `${p.score}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
