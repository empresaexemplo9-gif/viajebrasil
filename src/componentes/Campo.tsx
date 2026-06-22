import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, tipografia } from '../tema';

interface Props extends TextInputProps {
  /** Ícone à esquerda (opcional). */
  icone?: keyof typeof Ionicons.glyphMap;
  /** Rótulo acima do campo (opcional). */
  rotulo?: string;
  /** Mensagem de erro (deixa a borda vermelha). */
  erro?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Campo de texto reutilizável (ícone + input), extraído do login e do
 * newsletter. Usado por login, cadastro e formulários internos.
 */
export function Campo({ icone, rotulo, erro, containerStyle, style, ...rest }: Props) {
  return (
    <View style={containerStyle}>
      {rotulo ? <Text style={styles.rotulo}>{rotulo}</Text> : null}
      <View style={[styles.caixa, !!erro && styles.caixaErro]}>
        {icone ? <Ionicons name={icone} size={20} color={cores.textoClaro} style={styles.icone} /> : null}
        <TextInput
          placeholderTextColor={cores.textoClaro}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  rotulo: { ...tipografia.legenda, color: cores.textoSuave, marginBottom: 6 },
  caixa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  caixaErro: { borderColor: cores.erro },
  icone: { marginRight: 10 },
  input: { flex: 1, ...tipografia.corpo, color: cores.texto, paddingVertical: 12 },
  erro: { ...tipografia.legenda, color: cores.erro, marginTop: 6 },
});
