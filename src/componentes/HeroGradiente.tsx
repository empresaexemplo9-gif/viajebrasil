import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, espaco, raio, tipografia } from '../tema';
import { GradienteMarca } from './GradienteMarca';

interface Props {
  eyebrow?: string;
  titulo: React.ReactNode;
  subtitulo?: string;
  /** Slot inferior (ex.: barra de busca, CTA). */
  children?: React.ReactNode;
  /** Conteúdo do topo (ex.: marca + ações), renderizado acima do título. */
  topo?: React.ReactNode;
}

/**
 * Cabeçalho com degradê da marca (azul-marinho → azul), respeitando a safe area.
 * Base do novo visual da home e dos cabeçalhos internos.
 */
export function HeroGradiente({ eyebrow, titulo, subtitulo, children, topo }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <GradienteMarca variante="noite" style={[styles.base, { paddingTop: insets.top + espaco.md }]}>
      {topo}
      <View style={styles.conteudo}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
        <Text style={styles.titulo}>{titulo}</Text>
        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
      </View>
      {children}
    </GradienteMarca>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: espaco.lg,
    paddingBottom: espaco.xl,
    borderBottomLeftRadius: raio.xl,
    borderBottomRightRadius: raio.xl,
  },
  conteudo: { marginTop: espaco.lg },
  eyebrow: { ...tipografia.rotuloMicro, color: cores.amarelo, marginBottom: espaco.xs },
  titulo: { ...tipografia.display, color: cores.textoInverso, lineHeight: 38 },
  subtitulo: { ...tipografia.corpo, color: cores.textoInverso, opacity: 0.9, marginTop: espaco.sm },
});
