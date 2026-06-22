export { cores, degrades } from './cores';
export type { Cor } from './cores';
export { tipografia } from './tipografia';

/** Espaçamentos base (múltiplos de 4). */
export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Altura da barra de abas inferior — fonte única usada pelo layout das abas
 * e pelo padding do conteúdo das telas, para não dessincronizar. */
export const alturaBarraAbas = 64;

/** Raios de borda. */
export const raio = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Sombras (tingidas com o azul-marinho da marca). */
export const sombras = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#15315E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#15315E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  lg: {
    shadowColor: '#15315E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
} as const;

/** Sombra padrão para cartões (alias retrocompatível de `sombras.md`). */
export const sombra = sombras.md;
