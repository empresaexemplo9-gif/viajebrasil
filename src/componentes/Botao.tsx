import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, tipografia } from '../tema';

type Variante = 'primario' | 'destaque' | 'secundario' | 'contorno';
type Tamanho = 'sm' | 'md' | 'lg';

interface Props {
  titulo: string;
  aoPressionar: () => void;
  variante?: Variante;
  tamanho?: Tamanho;
  icone?: keyof typeof Ionicons.glyphMap;
  carregando?: boolean;
  desabilitado?: boolean;
  estilo?: StyleProp<ViewStyle>;
}

const ALTURA: Record<Tamanho, number> = { sm: 40, md: 52, lg: 56 };

/** Cor do conteúdo (texto/ícone/spinner) por variante. */
function corConteudo(variante: Variante): string {
  if (variante === 'contorno') return cores.verde;
  if (variante === 'secundario') return cores.azulMarinho;
  return cores.textoInverso;
}

export function Botao({
  titulo,
  aoPressionar,
  variante = 'primario',
  tamanho = 'md',
  icone,
  carregando = false,
  desabilitado = false,
  estilo,
}: Props) {
  const inativo = desabilitado || carregando;
  const cor = corConteudo(variante);
  return (
    <Pressable
      onPress={aoPressionar}
      disabled={inativo}
      style={({ pressed }) => [
        styles.base,
        { height: ALTURA[tamanho] },
        variante === 'primario' && styles.primario,
        variante === 'destaque' && styles.destaque,
        variante === 'secundario' && styles.secundario,
        variante === 'contorno' && styles.contorno,
        pressed && !inativo && styles.pressionado,
        inativo && styles.inativo,
        estilo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={cor} />
      ) : (
        <View style={styles.linha}>
          {icone ? <Ionicons name={icone} size={tamanho === 'sm' ? 16 : 18} color={cor} /> : null}
          <Text style={[styles.texto, { color: cor }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: raio.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  primario: { backgroundColor: cores.azul },
  destaque: { backgroundColor: cores.verde },
  secundario: { backgroundColor: cores.amarelo },
  contorno: { backgroundColor: cores.transparente, borderWidth: 1.5, borderColor: cores.verde },
  pressionado: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  inativo: { opacity: 0.5 },
  texto: { ...tipografia.botao },
});
