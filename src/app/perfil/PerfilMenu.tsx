'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { acaoExcluirPerfil, acaoSuspenderPerfil } from './acoes';

/**
 * Menu de ferramentas (⋯) sobreposto ao card do perfil, só para superadmin:
 * excluir ou bloquear o perfil sem sair da lista. Fica fora do <Link> do card
 * e usa stopPropagation para não navegar ao interagir.
 */
export function PerfilMenu({ perfilId, nome }: { perfilId: string; nome: string }) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const [pendente, iniciar] = useTransition();

  function rodar(fn: () => Promise<{ ok: boolean; erro?: string }>) {
    iniciar(async () => {
      await fn();
      setAberto(false);
      router.refresh();
    });
  }

  return (
    <div className="absolute right-2 top-2 z-10">
      <button
        type="button"
        aria-label="Ferramentas do perfil"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setAberto((v) => !v);
        }}
        className="grid h-8 w-8 place-items-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60"
      >
        <Icon name="more" size={18} />
      </button>

      {aberto && (
        <div
          onClick={(e) => e.preventDefault()}
          className="superficie absolute right-0 mt-1 w-44 rounded-xl border border-ink-100 p-1.5 shadow-lg"
        >
          <button
            type="button"
            disabled={pendente}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              rodar(() => acaoSuspenderPerfil(perfilId, true));
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <Icon name="shield" size={16} className="text-marca-500" duo />
            Bloquear perfil
          </button>
          <button
            type="button"
            disabled={pendente}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (window.confirm(`Excluir o perfil de ${nome}? Apaga a conta e todos os dados. Não pode ser desfeito.`)) {
                rodar(() => acaoExcluirPerfil(perfilId));
              }
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
          >
            <Icon name="trash" size={16} />
            Excluir perfil
          </button>
        </div>
      )}
    </div>
  );
}
