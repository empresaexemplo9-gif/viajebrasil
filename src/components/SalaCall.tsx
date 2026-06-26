'use client';

/**
 * Sala de call embutida via Jitsi (meet.jit.si) — sem conta, sem chave.
 * O acesso é controlado pela aplicação: só renderizamos isto para quem é
 * organizador ou aceitou o convite. O nome da sala é não-adivinhável.
 */
export function SalaCall({ sala, nome }: { sala: string; nome: string }) {
  const hash = `#userInfo.displayName=${encodeURIComponent(JSON.stringify(nome))}&config.prejoinPageEnabled=false`;
  const src = `https://meet.jit.si/${encodeURIComponent(sala)}${hash}`;
  const link = `https://meet.jit.si/${encodeURIComponent(sala)}`;
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
        <iframe
          src={src}
          title="Sala de call"
          allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"
          className="h-[70vh] w-full"
        />
      </div>
      <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-sm font-semibold text-marca-600"
      >
        Abrir a call em nova aba ↗
      </a>
    </div>
  );
}
