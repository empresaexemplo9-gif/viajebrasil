import { servicos } from '@/lib/dados';

export default function VitrinePage() {
  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Vitrine e Marketplace</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Serviços e produtos com preço, prazo e região de atendimento. O cliente envia uma proposta
        direto pela plataforma.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {servicos.map((s) => (
          <div key={s.id} className="cartao flex flex-col">
            <h3 className="font-bold text-tinta">{s.titulo}</h3>
            <p className="text-sm text-slate-500">por {s.perfil}</p>
            <p className="mt-3 flex-1 text-sm text-slate-600">{s.descricao}</p>

            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Preço</dt>
                <dd className="font-bold text-marca-700">{s.preco}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Prazo</dt>
                <dd className="font-semibold text-slate-700">{s.prazo}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Região</dt>
                <dd className="font-semibold text-slate-700">{s.regiao}</dd>
              </div>
            </dl>

            <button className="btn-primario mt-4 w-full">Enviar proposta</button>
          </div>
        ))}
      </div>
    </div>
  );
}
