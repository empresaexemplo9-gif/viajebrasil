import Link from 'next/link';
import { redirect } from 'next/navigation';
import { redefinirSenha } from '@/lib/server/recuperacao';

export const metadata = { title: 'Nova senha' };
export const dynamic = 'force-dynamic';

export default function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams?: { token?: string; erro?: string; ok?: string };
}) {
  const token = searchParams?.token ?? '';

  async function salvar(formData: FormData) {
    'use server';
    const t = String(formData.get('token') ?? '');
    const r = await redefinirSenha(t, String(formData.get('senha') ?? ''));
    if (!r.ok) redirect(`/redefinir-senha?token=${t}&erro=${encodeURIComponent(r.erro ?? 'Falha')}`);
    redirect('/redefinir-senha?ok=1');
  }

  return (
    <div className="container-app py-12">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-3xl font-black tracking-tight text-tinta">Criar nova senha</h1>

        {searchParams?.ok ? (
          <div className="cartao mt-6 text-center">
            <p className="text-sm font-semibold text-emerald-700">Senha redefinida com sucesso! 🎉</p>
            <Link href="/entrar" className="btn-primario mt-4 inline-block">
              Entrar
            </Link>
          </div>
        ) : !token ? (
          <p className="cartao mt-6 text-center text-sm text-rose-600">
            Link inválido. Peça um novo em{' '}
            <Link href="/recuperar-senha" className="font-semibold text-marca-600">
              Recuperar senha
            </Link>
            .
          </p>
        ) : (
          <form action={salvar} className="cartao mt-6 space-y-3">
            <input type="hidden" name="token" value={token} />
            {searchParams?.erro && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {searchParams.erro}
              </p>
            )}
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-500">
                Nova senha (8+, maiúscula, número, especial)
              </span>
              <input
                name="senha"
                type="password"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-marca-500"
              />
            </label>
            <button className="btn-primario w-full">Salvar nova senha</button>
          </form>
        )}
      </div>
    </div>
  );
}
