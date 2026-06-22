import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../tema';

interface Props {
  /** Ícone (Ionicons) OU inicial — se ambos, o ícone prevalece. */
  icone?: keyof typeof Ionicons.glyphMap;
  /** Texto/emoji exibido quando não há ícone (ex.: inicial do nome, emoji). */
  inicial?: string;
  tamanho?: number;
  cor?: string;
  corConteudo?: string;
}

/** Círculo com ícone, inicial ou emoji. */
export function Avatar({ icone, inicial, tamanho = 44, cor = cores.verde, corConteudo = cores.textoInverso }: Props) {
  return (
    <View
      style={[
        styles.base,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: cor },
      ]}
    >
      {icone ? (
        <Ionicons name={icone} size={tamanho * 0.5} color={corConteudo} />
      ) : (
        <Text style={[styles.texto, { fontSize: tamanho * 0.42, color: corConteudo }]}>{inicial ?? ''}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  texto: { fontWeight: '800' },
});
