/**
 * Moderação de conteúdo — diretrizes da comunidade.
 *
 * Filtro simples (sem IA) de linguajar e conteúdo apelativo em TEXTO. Imagens
 * não passam por análise automática: dependem do botão "Denunciar" + revisão do
 * superadmin. A lista é propositalmente conservadora; o objetivo é barrar o
 * óbvio (palavrões, conteúdo sexual explícito, ofensas), não censurar opinião.
 */

/** Termos bloqueados (raízes). Comparação é feita sem acento e por palavra. */
const TERMOS_PROIBIDOS: string[] = [
  // Palavrões / ofensas comuns (pt-BR)
  'porra', 'caralho', 'merda', 'foder', 'fodase', 'puta', 'puto', 'viado',
  'corno', 'arrombado', 'desgraca', 'vagabundo', 'vagabunda', 'fdp',
  'cuzao', 'buceta', 'piroca', 'rola', 'punheta', 'escroto', 'otario',
  'babaca', 'idiota', 'imbecil', 'retardado',
  // Conteúdo sexual / apelativo explícito
  'pornografia', 'porno', 'xvideos', 'xnxx', 'onlyfans', 'nudes', 'nudez',
  'sexo explicito', 'garota de programa', 'acompanhante sensual',
  // Discurso de ódio (raízes mais óbvias)
  'racista', 'nazista', 'genocidio',
];

/** Normaliza: minúsculas, remove acentos e pontuação repetida. */
function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // tira acentos (combining marks)
    .replace(/[^a-z0-9\s]/g, ' ') // pontuação vira espaço
    .replace(/\s+/g, ' ')
    .trim();
}

export interface ResultadoModeracao {
  proibido: boolean;
  /** Termo que disparou o bloqueio (para mensagem ao usuário). */
  termo?: string;
}

/** Analisa um texto e diz se contém conteúdo proibido. */
export function analisarTexto(texto: string): ResultadoModeracao {
  if (!texto) return { proibido: false };
  const limpo = normalizar(texto);
  // Compara por limites de palavra para evitar falso-positivo dentro de palavras
  // legítimas (ex.: "puto" não bate em "computador").
  for (const termo of TERMOS_PROIBIDOS) {
    const t = normalizar(termo);
    const padrao = new RegExp(`(^|\\s)${t.replace(/\s+/g, '\\s+')}(\\s|$)`);
    if (padrao.test(limpo)) return { proibido: true, termo };
  }
  return { proibido: false };
}

/** Mensagem padrão de bloqueio para mostrar ao usuário. */
export const MENSAGEM_BLOQUEIO =
  'Sua publicação contém conteúdo que viola as diretrizes da comunidade (linguajar ofensivo ou apelativo). Revise o texto e tente novamente.';
