import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../src/tema';
import { t } from '../src/i18n';
import { abrirBuscaOnibus } from '../src/servicos';

/** Converte "dd/mm/aaaa" em "aaaa-mm-dd" (formato da Buson). Vazio/ inválido → undefined. */
function paraISO(d: string): string | undefined {
  const m = d.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return undefined;
  const [, dd = '', mm = '', yyyy = ''] = m;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

export default function Onibus() {
  const [origem, setOrigem] = useState('');
  const [origemUf, setOrigemUf] = useState('');
  const [destino, setDestino] = useState('');
  const [destinoUf, setDestinoUf] = useState('');
  const [dataIda, setDataIda] = useState('');

  const inverter = () => {
    setOrigem(destino);
    setDestino(origem);
    setOrigemUf(destinoUf);
    setDestinoUf(origemUf);
  };

  const podeBuscar = Boolean(
    origem.trim() && origemUf.trim() && destino.trim() && destinoUf.trim() && paraISO(dataIda),
  );

  const buscar = () => {
    if (!podeBuscar) return;
    void abrirBuscaOnibus({
      origemCidade: origem,
      origemUf,
      destinoCidade: destino,
      destinoUf,
      dataIda: paraISO(dataIda),
    });
  };

  return (
    <>
      <Stack.Screen options={{ title: t.onibus.titulo }} />
      <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
      <View style={styles.intro}>
        <View style={styles.introIcone}>
          <Ionicons name="bus" size={24} color={cores.textoInverso} />
        </View>
        <Text style={styles.introTitulo}>{t.onibus.titulo}</Text>
        <Text style={styles.introSub}>{t.onibus.subtitulo}</Text>
      </View>

      <View style={styles.card}>
        <CidadeUf
          icone="radio-button-on-outline"
          rotulo={t.onibus.origem}
          placeholder={t.onibus.origemPh}
          cidade={origem}
          aoMudarCidade={setOrigem}
          uf={origemUf}
          aoMudarUf={setOrigemUf}
        />
        <Pressable style={styles.inverter} onPress={inverter} hitSlop={8} accessibilityLabel={t.onibus.inverter}>
          <Ionicons name="swap-vertical" size={18} color={cores.verde} />
        </Pressable>
        <CidadeUf
          icone="location-outline"
          rotulo={t.onibus.destino}
          placeholder={t.onibus.destinoPh}
          cidade={destino}
          aoMudarCidade={setDestino}
          uf={destinoUf}
          aoMudarUf={setDestinoUf}
        />

        <View style={styles.campo}>
          <Ionicons name="calendar-outline" size={20} color={cores.verde} />
          <View style={{ flex: 1 }}>
            <Text style={styles.campoRotulo}>{t.onibus.dataIda}</Text>
            <TextInput
              style={styles.campoInput}
              placeholder={t.onibus.dataPh}
              placeholderTextColor={cores.textoClaro}
              value={dataIda}
              onChangeText={setDataIda}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>
      </View>

      <Pressable style={[styles.botao, !podeBuscar && styles.botaoOff]} onPress={buscar} disabled={!podeBuscar}>
        <Ionicons name="search" size={18} color={cores.textoInverso} />
        <Text style={styles.botaoTexto}>{t.onibus.buscar}</Text>
      </Pressable>

      <View style={styles.aviso}>
        <Ionicons name="shield-checkmark" size={16} color={cores.verde} />
        <Text style={styles.avisoTexto}>{t.onibus.aviso}</Text>
      </View>
      </ScrollView>
    </>
  );
}

function CidadeUf({
  icone,
  rotulo,
  placeholder,
  cidade,
  aoMudarCidade,
  uf,
  aoMudarUf,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  placeholder: string;
  cidade: string;
  aoMudarCidade: (v: string) => void;
  uf: string;
  aoMudarUf: (v: string) => void;
}) {
  return (
    <View style={styles.campo}>
      <Ionicons name={icone} size={20} color={cores.verde} />
      <View style={{ flex: 1 }}>
        <Text style={styles.campoRotulo}>{rotulo}</Text>
        <TextInput
          style={styles.campoInput}
          placeholder={placeholder}
          placeholderTextColor={cores.textoClaro}
          value={cidade}
          onChangeText={aoMudarCidade}
        />
      </View>
      <View style={styles.ufBox}>
        <Text style={styles.campoRotulo}>{t.onibus.uf}</Text>
        <TextInput
          style={[styles.campoInput, styles.ufInput]}
          placeholder={t.onibus.ufPh}
          placeholderTextColor={cores.textoClaro}
          value={uf}
          onChangeText={(v) => aoMudarUf(v.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase())}
          autoCapitalize="characters"
          maxLength={2}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 16, gap: 16 },
  intro: { alignItems: 'center', gap: 6, paddingTop: 8 },
  introIcone: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: cores.verde,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  introTitulo: { fontSize: 22, fontWeight: '800', color: cores.azulMarinho },
  introSub: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', fontWeight: '500' },

  card: { backgroundColor: cores.superficie, borderRadius: raio.lg, padding: 16, gap: 12, ...sombra },
  campo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: cores.fundo,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  campoRotulo: { fontSize: 12, color: cores.textoSuave, fontWeight: '700' },
  campoInput: { fontSize: 16, color: cores.azulMarinho, fontWeight: '700', padding: 0 },
  ufBox: { width: 48, borderLeftWidth: 1, borderLeftColor: cores.borda, paddingLeft: 12 },
  ufInput: { width: 36 },
  inverter: {
    position: 'absolute',
    right: 70,
    top: 52,
    zIndex: 2,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 999,
    padding: 8,
  },
  botao: {
    backgroundColor: cores.verde,
    borderRadius: raio.md,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...sombra,
  },
  botaoOff: { opacity: 0.5 },
  botaoTexto: { color: cores.textoInverso, fontWeight: '800', fontSize: 16 },
  aviso: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  avisoTexto: { color: cores.textoSuave, fontSize: 12, fontWeight: '600' },
});
