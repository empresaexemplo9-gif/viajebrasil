import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { cores, raio, sombras } from '../tema';

interface Props {
  children: React.ReactNode;
  /** Intensidade da sombra. */
  elevacao?: keyof typeof sombras;
  /** Quando definido, o cartão vira pressionável (com leve scale). */
  aoPressionar?: () => void;
  /** Destaca a borda (ex.: card selecionado). */
  destacado?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Superfície base reutilizável (fundo branco, cantos arredondados, sombra),
 * substituindo o bloco de estilo de card repetido por todas as telas.
 */
export function Cartao({ children, elevacao = 'md', aoPressionar, destacado = false, style }: Props) {
  const base = [
    styles.base,
    sombras[elevacao],
    destacado && styles.destacado,
    style,
  ];

  if (!aoPressionar) return <View style={base}>{children}</View>;

  return (
    <Pressable
      onPress={aoPressionar}
      style={({ pressed }) => [...base, pressed && styles.pressionado]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: cores.superficie,
    borderRadius: raio.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 16,
  },
  destacado: { borderColor: cores.verde, borderWidth: 2 },
  pressionado: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
