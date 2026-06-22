import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { degrades } from '../tema';

interface Props {
  /** Qual degradê da marca usar (marca, ceu, sol, noite). */
  variante?: keyof typeof degrades;
  /** Direção: diagonal (padrão), vertical ou horizontal. */
  direcao?: 'diagonal' | 'vertical' | 'horizontal';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const PONTOS = {
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  vertical: { start: { x: 0, y: 0 }, end: { x: 0, y: 1 } },
  horizontal: { start: { x: 0, y: 0 }, end: { x: 1, y: 0 } },
} as const;

/**
 * Único ponto que aplica os degradês da marca (`degrades`). Use no lugar de
 * fundos chapados em heros, cabeçalhos e cartões de destaque.
 */
export function GradienteMarca({ variante = 'marca', direcao = 'diagonal', style, children }: Props) {
  const p = PONTOS[direcao];
  return (
    <LinearGradient colors={degrades[variante]} start={p.start} end={p.end} style={[styles.base, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: { flex: 0 },
});
