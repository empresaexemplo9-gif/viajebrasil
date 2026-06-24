/**
 * Motor de classificação de currículos (IA de aderência).
 *
 * Para o MVP, o score (0–100) é calculado por uma heurística transparente:
 * aderência de habilidades, tempo de experiência, certificações e referências.
 * Quando `ANTHROPIC_API_KEY` estiver ativo, a análise pode ser aprofundada
 * (resumo e leitura semântica do currículo) — ver `src/lib/ia.ts`. A entrega
 * proativa e a profundidade variam por nível do plano Prime.
 */
import type { Vaga } from './dados';
import type { Candidato } from './candidatos';

export interface Criterios {
  aderencia: number; // 0–40
  experiencia: number; // 0–25
  certificacoes: number; // 0–20
  referencias: number; // 0–15
}

export interface Avaliacao {
  candidato: Candidato;
  score: number; // 0–100
  criterios: Criterios;
  resumo: string;
}

const norm = (s: string) => s.trim().toLowerCase();

export function classificar(c: Candidato, vaga: Vaga): Avaliacao {
  const habCand = new Set(c.habilidades.map(norm));
  const emComum = vaga.habilidades.filter((h) => habCand.has(norm(h)));
  const propHab = vaga.habilidades.length ? emComum.length / vaga.habilidades.length : 0;
  const mesmaArea = norm(c.area) === norm(vaga.area);

  const aderencia = Math.round(propHab * 32 + (mesmaArea ? 8 : 0)); // 0–40
  const experiencia = Math.min(25, c.anosExperiencia * 4); // 0–25 (≈6+ anos = teto)
  const certificacoes = Math.min(20, c.certificacoes.length * 7); // 0–20
  const referencias = Math.min(15, c.referencias * 5); // 0–15

  const score = Math.max(0, Math.min(100, aderencia + experiencia + certificacoes + referencias));

  const nivel =
    c.anosExperiencia >= 6 ? 'sênior' : c.anosExperiencia >= 3 ? 'pleno' : 'júnior';
  const resumo =
    `${c.nome} — ${nivel}, ${c.anosExperiencia} ano(s) em ${c.area}. ` +
    `${emComum.length}/${vaga.habilidades.length} habilidades da vaga` +
    `${c.certificacoes.length ? `, ${c.certificacoes.length} certificação(ões)` : ''}` +
    `${c.referencias ? `, ${c.referencias} referência(s)` : ''}.`;

  return {
    candidato: c,
    score,
    criterios: { aderencia, experiencia, certificacoes, referencias },
    resumo,
  };
}

/** Ranqueia candidatos para uma vaga, do maior para o menor score. */
export function ranquear(candidatos: Candidato[], vaga: Vaga): Avaliacao[] {
  return candidatos
    .map((c) => classificar(c, vaga))
    .sort((a, b) => b.score - a.score);
}
