import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, tipografia } from '../tema';
import { Cartao } from './Cartao';
import { Avatar } from './Avatar';

interface Props {
  rotulo: string;
  valor: string | number;
  icone: keyof typeof Ionicons.glyphMap;
  cor?: string;
  dica?: string;
}

/** Cartão de métrica para o painel do admin. */
export function CartaoEstatistica({ rotulo, valor, icone, cor = cores.verde, dica }: Props) {
  return (
    <Cartao elevacao="sm" style={styles.base}>
      <View style={styles.topo}>
        <Avatar icone={icone} tamanho={38} cor={cor + '22'} corConteudo={cor} />
        {dica ? <Text style={styles.dica}>{dica}</Text> : null}
      </View>
      <Text style={styles.valor}>{valor}</Text>
      <Text style={styles.rotulo}>{rotulo}</Text>
    </Cartao>
  );
}

const styles = StyleSheet.create({
  base: { flexGrow: 1, minWidth: 150, gap: 6 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dica: { ...tipografia.legenda, color: cores.textoSuave },
  valor: { ...tipografia.tituloGrande, color: cores.azulMarinho, marginTop: 6 },
  rotulo: { ...tipografia.corpoSuave, color: cores.textoSuave },
});
