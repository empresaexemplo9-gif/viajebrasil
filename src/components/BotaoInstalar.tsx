'use client';

import { useEffect, useState } from 'react';

interface PromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export function BotaoInstalar() {
  const [prompt, setPrompt] = useState<PromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as PromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', () => setInstalado(true));
    const ua = navigator.userAgent || '';
    setIos(/iphone|ipad|ipod/i.test(ua));
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalado(true);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  async function instalar() {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
  }

  if (instalado) {
    return <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">App instalado ✅ — abra pela tela inicial.</p>;
  }

  if (prompt) {
    return (
      <button onClick={instalar} className="btn-primario" type="button">
        📲 Instalar app agora
      </button>
    );
  }

  // Sem prompt automático (iOS, ou navegador que não suporta) → instruções.
  return (
    <div className="cartao">
      <h3 className="font-bold text-tinta">{ios ? 'No iPhone/iPad (Safari)' : 'Como instalar'}</h3>
      {ios ? (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Toque no botão <strong>Compartilhar</strong> (quadrado com seta ↑).</li>
          <li>Escolha <strong>“Adicionar à Tela de Início”</strong>.</li>
          <li>Toque em <strong>Adicionar</strong> — pronto, vira um app na tela inicial.</li>
        </ol>
      ) : (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Abra o menu do navegador (⋮).</li>
          <li>Toque em <strong>“Instalar app”</strong> ou <strong>“Adicionar à tela inicial”</strong>.</li>
          <li>Confirme — o ícone da DRAP aparece na sua tela inicial.</li>
        </ol>
      )}
    </div>
  );
}
