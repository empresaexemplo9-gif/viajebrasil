import Link from 'next/link';
import { redirect } from 'next/navigation';
import { obterContexto } from '@/lib/server/session';
import { ehAdminPlataforma } from '@/lib/server/admin';
import { carregarUsuario } from '@/lib/server/repos';
import { feedGlobal, criarPost } from '@/lib/server/feed';
import { CabecalhoPerfil } from '@/components/CabecalhoPerfil';
import { Composer } from './Composer';
import { PostCard } from './PostCard';

export const metadata = { title: 'Feed' };
export const dynamic = 'force-dynamic';

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: { erro?: string };
}) {
  const ctx = await obterContexto();
  const [u, posts] = await Promise.all([
    ctx ? carregarUsuario(ctx.tenantId, ctx.userId) : Promise.resolve(null),
    feedGlobal(),
  ]);
  const souAdmin = ehAdminPlataforma(ctx?.email);

  async function publicar(formData: FormData) {
    'use server';
    const atual = await obterContexto();
    if (!atual) redirect('/entrar?proximo=/feed');
    const r = await criarPost(
      atual.userId,
      atual.tenantId,
      String(formData.get('texto') ?? ''),
      String(formData.get('imagemUrl') ?? '').trim(),
    );
    redirect(r.ok ? '/feed' : `/feed?erro=${encodeURIComponent(r.erro ?? 'Falha ao publicar.')}`);
  }

  return (
    <div className="container-app py-8">
      {/* Cabeçalho social (banner + foto) — como nas redes sociais */}
      {ctx && u ? (
        <CabecalhoPerfil
          id={u.id}
          nome={u.nome}
          avatarUrl={u.avatarUrl}
          bannerUrl={u.perfil?.bannerUrl}
          subtitulo={u.perfil?.areaAtuacao || u.email}
          acaoHref="/painel"
          acaoRotulo="Editar perfil"
        />
      ) : (
        <div>
          <h1 className="text-3xl font-black tracking-tight text-tinta">Feed</h1>
          <p className="mt-2 text-slate-600">
            <Link href="/entrar?proximo=/feed" className="font-semibold text-marca-600">
              Entre
            </Link>{' '}
            para publicar e personalizar seu perfil.
          </p>
        </div>
      )}

      {ctx && (
        <div className="mt-6">
          {searchParams?.erro && (
            <p className="mb-3 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {searchParams.erro}
            </p>
          )}
          <Composer acao={publicar} />
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {posts.length === 0 && (
          <p className="cartao text-center text-sm text-slate-500">Ainda não há publicações.</p>
        )}
        {posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            souDono={ctx?.userId === p.autorId}
            souAdmin={souAdmin}
            logado={Boolean(ctx)}
          />
        ))}
      </div>
    </div>
  );
}
