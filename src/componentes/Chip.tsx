import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, tipografia } from '../tema';

interface Props {
  rotulo: string;
  selecionado?: boolean;
  aoPressionar?: () => void;
  icone?: keyof typeof Ionicons.glyphMap;
}

/** Pílula selecionável (filtros, opções rápidas). */
export function Chip({ rotulo, selecionado = false, aoPressionar, icone }: Props) {
  return (
    <Pressable
      onPress={aoPressionar}
      style={({ pressed }) => [
        styles.base,
        selecionado ? styles.ativo : styles.inativo,
        pressed && { opacity: 0.85 },
      ]}
    >
      {icone ? (
        <Ionicons name={icone} size={14} color={selecionado ? cores.textoInverso : cores.verde} />
      ) : null}
      <Text style={[styles.texto, selecionado ? styles.textoAtivo : styles.textoInativo]}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: raio.pill,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1.5,
  },
  ativo: { backgroundColor: cores.verde, borderColor: cores.verde },
  inativo: { backgroundColor: cores.superficie, borderColor: cores.verde },
  texto: { ...tipografia.legenda },
  textoAtivo: { color: cores.textoInverso },
  textoInativo: { color: cores.verde },
});
