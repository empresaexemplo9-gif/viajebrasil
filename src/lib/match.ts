import type { Perfil, Vaga } from './dados';

export interface ResultadoMatch {
  vaga: Vaga;
  /** Pontuação 0–100 de aderência do perfil à vaga. */
  pontuacao: number;
  habilidadesEmComum: string[];
}

/** Normaliza para comparar (minúsculas, sem espaços nas pontas). */
const norm = (s: string) => s.trim().toLowerCase();

/**
 * Match básico do MVP: combina habilidades em comum (peso maior), mesma área
 * e mesma região (ou remoto). Resultado de 0 a 100.
 */
export function calcularMatch(perfil: Perfil, vaga: Vaga): ResultadoMatch {
  const habPerfil = new Set(perfil.habilidades.map(norm));
  const emComum = vaga.habilidades.filter((h) => habPerfil.has(norm(h)));

  const propHabilidades = vaga.habilidades.length
    ? emComum.length / vaga.habilidades.length
    : 0;

  const mesmaArea = norm(perfil.areaAtuacao) === norm(vaga.area);
  const regiaoOk =
    norm(vaga.regiao) === 'remoto' || norm(perfil.regiao) === norm(vaga.regiao);

  const pontuacao = Math.round(
    propHabilidades * 70 + (mesmaArea ? 20 : 0) + (regiaoOk ? 10 : 0),
  );

  return { vaga, pontuacao, habilidadesEmComum: emComum };
}

/** Ranqueia as vagas mais aderentes a um perfil. */
export function vagasParaPerfil(perfil: Perfil, vagas: Vaga[]): ResultadoMatch[] {
  return vagas
    .map((v) => calcularMatch(perfil, v))
    .sort((a, b) => b.pontuacao - a.pontuacao);
}
