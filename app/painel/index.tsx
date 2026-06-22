import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Cartao, Chip, HeroGradiente, Selo, tomStatusLead } from '../../src/componentes';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';
import { listarLeads } from '../../src/servicos';
import type { Lead, StatusLead } from '../../src/tipos';

const FILTROS: (StatusLead | 'todos')[] = [
  'todos',
  'novo',
  'atribuido',
  'em_atendimento',
  'convertido',
  'perdido',
];

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function PainelLeads() {
  const router = useRouter();
  const { usuario, sair } = useAutenticacao();
  const [filtro, setFiltro] = useState<StatusLead | 'todos'>('todos');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const lista = await listarLeads(filtro === 'todos' ? {} : { status: filtro });
      setLeads(lista);
    } catch {
      setErro(t.painel.erro);
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // Recarrega ao voltar do detalhe (status pode ter mudado).
  useFocusEffect(
    useCallback(() => {
      void carregar();
    }, [carregar]),
  );

  return (
    <View style={styles.tela}>
      <HeroGradiente
        eyebrow={t.painel.subtitulo}
        titulo={t.painel.titulo}
        subtitulo={usuario?.nome ? `Olá, ${usuario.nome}` : undefined}
        topo={
          <View style={styles.topo}>
            <Pressable hitSlop={8} onPress={() => router.replace('/(tabs)')}>
              <Ionicons name="home" size={22} color={cores.textoInverso} />
            </Pressable>
            <Pressable hitSlop={8} onPress={sair}>
              <Ionicons name="log-out-outline" size={22} color={cores.textoInverso} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
        style={styles.filtrosBar}
      >
        {FILTROS.map((f) => (
          <Chip
            key={f}
            rotulo={f === 'todos' ? t.statusLead.todos : t.statusLead[f]}
            selecionado={filtro === f}
            aoPressionar={() => setFiltro(f)}
          />
        ))}
      </ScrollView>

      {carregando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color={cores.verde} />
          <Text style={styles.aviso}>{t.painel.carregando}</Text>
        </View>
      ) : erro ? (
        <View style={styles.centro}>
          <Ionicons name="cloud-offline-outline" size={40} color={cores.textoClaro} />
          <Text style={styles.aviso}>{erro}</Text>
        </View>
      ) : leads.length === 0 ? (
        <View style={styles.centro}>
          <Ionicons name="airplane-outline" size={40} color={cores.textoClaro} />
          <Text style={styles.aviso}>{t.painel.vazio}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
          {leads.map((l) => (
            <Cartao key={l.id} elevacao="sm" aoPressionar={() => router.push(`/painel/${l.id}`)} style={styles.item}>
              <View style={styles.itemTopo}>
                <Text style={styles.trecho} numberOfLines={1}>
                  {(l.origem_cidade || '—') + ' → ' + (l.destino_cidade || '—')}
                </Text>
                <Selo texto={t.statusLead[l.status]} tom={tomStatusLead(l.status)} />
              </View>
              <Text style={styles.sub}>
                {l.numero_passageiros} {l.numero_passageiros === 1 ? 'passageiro' : 'passageiros'} ·{' '}
                {l.classe || '—'} · {l.data_volta ? `${l.data_ida} → ${l.data_volta}` : t.painel.somenteIda}
              </Text>
              <View style={styles.itemRodape}>
                <Text style={styles.contato} numberOfLines={1}>
                  {l.contato_nome || (l.nomes?.[0] ?? '—')}
                </Text>
                <Text style={styles.tempo}>{formatarData(l.criado_em)}</Text>
              </View>
            </Cartao>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  topo: { flexDirection: 'row', justifyContent: 'space-between' },
  filtrosBar: { flexGrow: 0 },
  filtros: { paddingHorizontal: espaco.lg, paddingVertical: espaco.md, gap: espaco.sm },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: espaco.sm, padding: espaco.xl },
  aviso: { ...tipografia.corpoSuave, color: cores.textoSuave, textAlign: 'center' },
  lista: { paddingHorizontal: espaco.lg, paddingBottom: espaco.xxl, gap: espaco.md },
  item: { gap: espaco.xs },
  itemTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: espaco.sm },
  trecho: { ...tipografia.subtitulo, color: cores.azulMarinho, flex: 1 },
  sub: { ...tipografia.corpoSuave, color: cores.textoSuave },
  itemRodape: { flexDirection: 'row', justifyContent: 'space-between', marginTop: espaco.xs },
  contato: { ...tipografia.legenda, color: cores.texto, flex: 1 },
  tempo: { ...tipografia.legenda, color: cores.textoClaro },
});
