import { feed, type TipoPost } from '@/lib/dados';

const rotuloTipo: Record<TipoPost, { texto: string; classe: string }> = {
  'busca-servico': { texto: 'Busca serviço', classe: 'bg-amber-100 text-amber-700' },
  'busca-parceiro': { texto: 'Busca parceiro', classe: 'bg-marca-100 text-marca-700' },
  disponivel: { texto: 'Disponível', classe: 'bg-emerald-100 text-emerald-700' },
  produto: { texto: 'Produto', classe: 'bg-sky-100 text-sky-700' },
};

export default function FeedPage() {
  return (
    <div className="container-app py-12">
      <h1 className="text-3xl font-black tracking-tight text-tinta">Rede de Captação</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        O feed onde aparecem clientes buscando serviços, empresas buscando parceiros, profissionais
        disponíveis e produtos à venda.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {feed.map((post) => {
          const r = rotuloTipo[post.tipo];
          return (
            <article key={post.id} className="cartao">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-marca-100 font-black text-marca-700">
                    {post.autor.charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold text-tinta">{post.autor}</p>
                    <p className="text-xs text-slate-400">
                      {post.regiao} · {post.quando}
                    </p>
                  </div>
                </div>
                <span className={`selo ${r.classe}`}>{r.texto}</span>
              </div>

              <p className="mt-3 text-sm text-slate-700">{post.texto}</p>

              <div className="mt-4 flex gap-2">
                <button className="btn-primario !px-4 !py-2">Conectar</button>
                <button className="btn-secundario !px-4 !py-2">Mensagem</button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
