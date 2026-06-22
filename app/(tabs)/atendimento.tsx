import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao, Cartao, ChatbotAereo, HeroGradiente } from '../../src/componentes';
import { TENANT } from '../../src/servicos';

// Mesma chave usada pelo ChatbotAereo para guardar a conversa ativa.
const CHAVE = `@viajebrasil/${TENANT.id}/chatAereo`;

export default function Atendimento() {
  const [chatAberto, setChatAberto] = useState(false);
  const [temConversa, setTemConversa] = useState(false);

  const verificar = useCallback(async () => {
    try {
      setTemConversa(!!(await AsyncStorage.getItem(CHAVE)));
    } catch {
      setTemConversa(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void verificar();
    }, [verificar]),
  );

  const aoFechar = useCallback(() => {
    setChatAberto(false);
    void verificar();
  }, [verificar]);

  return (
    <View style={styles.tela}>
      <HeroGradiente eyebrow={t.atendimento.eyebrow} titulo={t.atendimento.titulo} subtitulo={t.atendimento.sub} />

      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
        <Cartao elevacao="md" style={styles.cartao}>
          <View style={styles.icone}>
            <Ionicons name="chatbubbles" size={30} color={cores.verde} />
          </View>
          <Text style={styles.titulo}>{temConversa ? t.atendimento.emAndamento : t.atendimento.nenhuma}</Text>
          <Text style={styles.sub}>{temConversa ? t.atendimento.emAndamentoSub : t.atendimento.nenhumaSub}</Text>
          <Botao
            titulo={temConversa ? t.atendimento.abrir : t.atendimento.iniciar}
            icone="chatbubbles-outline"
            variante="destaque"
            aoPressionar={() => setChatAberto(true)}
            estilo={{ alignSelf: 'stretch' }}
          />
        </Cartao>
      </ScrollView>

      <ChatbotAereo visivel={chatAberto} aoFechar={aoFechar} />
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg },
  cartao: { alignItems: 'center', gap: espaco.sm, paddingVertical: espaco.xl },
  icone: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espaco.xs,
  },
  titulo: { ...tipografia.subtitulo, color: cores.azulMarinho, textAlign: 'center' },
  sub: { ...tipografia.corpoSuave, color: cores.textoSuave, textAlign: 'center', marginBottom: espaco.sm },
});
