import Link from 'next/link';
import { Icon } from './Icon';

export function Footer() {
  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-ink-300">
      <div className="container-app py-8 text-sm">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/drap-logo.svg" alt="DRAP Business" className="h-7 w-auto" />
          <div className="flex items-center gap-4">
            <Link
              href="/instalar"
              className="inline-flex items-center gap-1.5 font-semibold text-marca-400 hover:text-marca-300"
            >
              <Icon name="download" size={16} />
              Baixar o app
            </Link>
            <Link href="/termos" className="hover:text-ink-100">
              Termos de Uso
            </Link>
            <Link href="/privacidade" className="hover:text-ink-100">
              Privacidade
            </Link>
            <span className="hidden sm:inline">Hub digital de negócios e conexões.</span>
          </div>
          <p>© {new Date().getFullYear()} DRAP Business</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 border-t border-ink-800 pt-4 text-xs text-ink-400">
          <span>Desenvolvido por</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/drap-wordmark.svg" alt="DRAP" className="h-4 w-auto" />
        </div>
      </div>
    </footer>
  );
}
