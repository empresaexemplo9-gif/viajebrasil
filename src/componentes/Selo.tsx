import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { cores, raio, tipografia } from '../tema';

type Tom = 'verde' | 'amarelo' | 'laranja' | 'azul' | 'erro' | 'neutro';

interface Props {
  texto: string;
  tom?: Tom;
  style?: StyleProp<ViewStyle>;
}

const FUNDO: Record<Tom, string> = {
  verde: cores.verde,
  amarelo: cores.amarelo,
  laranja: cores.laranja,
  azul: cores.azul,
  erro: cores.erro,
  neutro: cores.superficieAlt,
};

/** Badge/etiqueta inline com tons da marca (OFF, "Em alta", status, etc.). */
export function Selo({ texto, tom = 'verde', style }: Props) {
  const claro = tom === 'amarelo' || tom === 'neutro';
  return (
    <View style={[styles.base, { backgroundColor: FUNDO[tom] }, style]}>
      <Text style={[styles.texto, { color: claro ? cores.azulMarinho : cores.textoInverso }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: raio.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  texto: { ...tipografia.rotuloMicro },
});
