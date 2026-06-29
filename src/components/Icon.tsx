import type { ReactNode } from 'react';

/**
 * Ícones de linha (stroke) minimalistas, no lugar de emojis — visual mais
 * profissional e sóbrio. Usam currentColor, então herdam a cor do texto.
 */
export type NomeIcone =
  | 'home'
  | 'users'
  | 'briefcase'
  | 'store'
  | 'trophy'
  | 'star'
  | 'bell'
  | 'message'
  | 'calendar'
  | 'chart'
  | 'doc'
  | 'gear'
  | 'card'
  | 'download'
  | 'key'
  | 'shield'
  | 'flag'
  | 'tag'
  | 'edit'
  | 'trash'
  | 'share'
  | 'link'
  | 'external'
  | 'send'
  | 'more'
  | 'x'
  | 'bot'
  | 'feed'
  | 'megaphone';

const PATHS: Record<NomeIcone, ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />,
  users: <path d="M9 11a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 11ZM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5a3 3 0 0 1 0 6M21 20c0-2.4-1.2-4.1-3-5" />,
  briefcase: <path d="M4 7.5h16a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.5a1 1 0 0 1 1-1ZM8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 12.5h18" />,
  store: <path d="M4.5 9.5V20h15V9.5M3 9.5l1.6-5h14.8L21 9.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-4.5 0A2.5 2.5 0 0 1 7 9.5a2.5 2.5 0 0 1-4 0ZM9.5 20v-5h5v5" />,
  trophy: <path d="M8 4h8v4.5a4 4 0 0 1-8 0V4ZM8 5.5H5V7a3 3 0 0 0 3 3M16 5.5h3V7a3 3 0 0 1-3 3M10 14.5V17h4v-2.5M9 20h6" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9L12 3.5Z" />,
  bell: <path d="M6 9a6 6 0 0 1 12 0c0 4.5 2 5.5 2 5.5H4S6 13.5 6 9ZM10 19a2 2 0 0 0 4 0" />,
  message: <path d="M4 5.5h16v10H8.5L4 19.5v-14Z" />,
  calendar: <path d="M4 6h16v14H4zM4 10h16M8.5 3.5v4M15.5 3.5v4" />,
  chart: <path d="M4 4v16h16M7.5 14.5l3-3 3 2 4-5.5" />,
  doc: <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v4h4M9 12.5h6M9 16h4" />,
  gear: <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8 6 18M18 6l1.8-1.8" />,
  card: <path d="M3 6.5h18v11H3zM3 10h18" />,
  download: <path d="M12 4v10M8 11l4 4 4-4M5 19h14" />,
  key: <path d="M14.5 5a4.5 4.5 0 1 0-3.7 7.1L4 19v0M9 16h2.5M11 13.5l1.5 1.5M11 12.1A4.5 4.5 0 0 0 14.5 5" />,
  shield: <path d="M12 3.5 19 6v5.5c0 4-3 7-7 8.5-4-1.5-7-4.5-7-8.5V6l7-2.5ZM9.5 12l1.8 1.8L15 10" />,
  flag: <path d="M6 21V4M6 4.5h11l-2 3.5 2 3.5H6" />,
  tag: <path d="M3.5 10.5 11 3h7a1 1 0 0 1 1 1v7l-7.5 7.5a1.5 1.5 0 0 1-2.1 0L3.5 12.6a1.5 1.5 0 0 1 0-2.1ZM15.5 7.5h.01" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
  trash: <path d="M5 7h14M9.5 7V5h5v2M7 7l.9 13h8.2L17 7M10 11v6M14 11v6" />,
  share: <path d="M6 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM18 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6" />,
  link: <path d="M9.5 14.5 14.5 9.5M10.5 6.8l1-1a3.5 3.5 0 0 1 5 5l-1 1M13.5 17.2l-1 1a3.5 3.5 0 0 1-5-5l1-1" />,
  external: <path d="M14 4h6v6M20 4l-8.5 8.5M18 13.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5.5" />,
  send: <path d="M4.5 12 20 5l-7 15-2.2-6.8L4.5 12Z" />,
  more: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  bot: <path d="M8 8h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2ZM12 5v3M9.5 13h.01M14.5 13h.01M9.5 16h5" />,
  feed: <path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM8 8h8M8 12h8M8 16h5" />,
  megaphone: <path d="M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1ZM18 9a3 3 0 0 1 0 6" />,
};

export function Icon({
  name,
  className = '',
  size = 20,
  duo = false,
}: {
  name: NomeIcone;
  className?: string;
  size?: number;
  /** Duotone: preenche o interior de navy mantendo o contorno (cor do texto). */
  duo?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={duo ? '#141B2B' : 'none'}
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
