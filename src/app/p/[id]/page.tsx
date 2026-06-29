import Link from 'next/link';
import { notFound } from 'next/navigation';
import { postPorId } from '@/lib/server/feed';
import { obterContexto } from '@/lib/server/session';
import { ehAdminPlataforma } from '@/lib/server/admin';
import { PostCard } from '@/app/feed/PostCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await postPorId(params.id);
  if (!post) return { title: 'Publicação' };
  return {
    title: `${post.autorNome} — DRAP Business`,
    description: post.texto.slice(0, 150) || 'Publicação na DRAP Business',
  };
}

export default async function PostPermalinkPage({ params }: { params: { id: string } }) {
  const post = await postPorId(params.id);
  if (!post) notFound();
  const ctx = await obterContexto();

  return (
    <div className="container-app py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/feed" className="text-sm font-semibold text-marca-600 hover:underline">
          ← Ver o feed
        </Link>
        <div className="mt-4">
          <PostCard
            post={post}
            souDono={ctx?.userId === post.autorId}
            souAdmin={ehAdminPlataforma(ctx?.email)}
            logado={Boolean(ctx)}
          />
        </div>
      </div>
    </div>
  );
}
