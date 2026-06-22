import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, tipografia } from '../../src/tema';
import { t } from '../../src/i18n';
import { Botao, Campo, Cartao, Selo } from '../../src/componentes';
import {
  atualizarOferta,
  criarOferta,
  excluirOferta,
  listarOfertasAdmin,
} from '../../src/servicos';
import type { HomeOferta } from '../../src/tipos';

interface Form {
  id?: string;
  titulo: string;
  cidade: string;
  preco: string;
  imagem_url: string;
  badge: string;
  ordem: string;
  ativo: boolean;
}

const FORM_VAZIO: Form = { titulo: '', cidade: '', preco: '', imagem_url: '', badge: '', ordem: '0', ativo: true };

function paraForm(o: HomeOferta): Form {
  return {
    id: o.id,
    titulo: o.titulo ?? '',
    cidade: o.cidade ?? '',
    preco: o.preco != null ? String(o.preco) : '',
    imagem_url: o.imagem_url ?? '',
    badge: o.badge ?? '',
    ordem: String(o.ordem ?? 0),
    ativo: o.ativo !== false,
  };
}

export default function AdminOfertas() {
  const [ofertas, setOfertas] = useState<HomeOferta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setOfertas(await listarOfertasAdmin());
    } catch {
      // mantém lista atual
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const set = (campo: keyof Form, valor: string | boolean) =>
    setForm((f) => (f ? { ...f, [campo]: valor } : f));

  const salvar = async () => {
    if (!form || !form.titulo.trim()) return;
    setSalvando(true);
    try {
      const dados: Partial<HomeOferta> = {
        titulo: form.titulo.trim(),
        cidade: form.cidade.trim() || null,
        preco: form.preco.trim() ? Number(form.preco.replace(',', '.')) : null,
        imagem_url: form.imagem_url.trim() || null,
        badge: form.badge.trim() || null,
        ordem: Number(form.ordem) || 0,
        ativo: form.ativo,
      };
      if (form.id) await atualizarOferta(form.id, dados);
      else await criarOferta(dados);
      setForm(null);
      await carregar();
    } catch {
      // erro silencioso; mantém o form aberto
    } finally {
      setSalvando(false);
    }
  };

  const remover = async (id: string) => {
    try {
      await excluirOferta(id);
      await carregar();
    } catch {
      // ignora
    }
  };

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.sub}>{t.admin.ofertasSub}</Text>

      {form ? (
        <Cartao elevacao="md" style={styles.form}>
          <Campo rotulo={t.admin.fTitulo} value={form.titulo} onChangeText={(v) => set('titulo', v)} />
          <Campo rotulo={t.admin.fCidade} value={form.cidade} onChangeText={(v) => set('cidade', v)} />
          <Campo rotulo={t.admin.fPreco} value={form.preco} onChangeText={(v) => set('preco', v)} keyboardType="numeric" />
          <Campo rotulo={t.admin.fImagem} value={form.imagem_url} onChangeText={(v) => set('imagem_url', v)} autoCapitalize="none" />
          <Campo rotulo={t.admin.fBadge} value={form.badge} onChangeText={(v) => set('badge', v)} />
          <Campo rotulo={t.admin.fOrdem} value={form.ordem} onChangeText={(v) => set('ordem', v)} keyboardType="number-pad" />
          <View style={styles.switchLinha}>
            <Text style={styles.switchTexto}>{t.admin.fAtivo}</Text>
            <Switch value={form.ativo} onValueChange={(v) => set('ativo', v)} trackColor={{ true: cores.verde }} />
          </View>
          <View style={styles.formAcoes}>
            <Botao titulo={t.admin.cancelar} variante="contorno" tamanho="sm" aoPressionar={() => setForm(null)} estilo={{ flex: 1 }} />
            <Botao titulo={t.admin.salvar} variante="destaque" tamanho="sm" aoPressionar={salvar} carregando={salvando} estilo={{ flex: 1 }} />
          </View>
        </Cartao>
      ) : (
        <Botao titulo={t.admin.nova} icone="add" variante="destaque" aoPressionar={() => setForm(FORM_VAZIO)} />
      )}

      {carregando ? (
        <ActivityIndicator size="large" color={cores.verde} style={{ marginTop: espaco.xl }} />
      ) : ofertas.length === 0 ? (
        <Text style={styles.vazio}>{t.admin.semOfertas}</Text>
      ) : (
        ofertas.map((o) => (
          <Cartao key={o.id} elevacao="sm" style={styles.item}>
            <View style={{ flex: 1 }}>
              <View style={styles.itemTopo}>
                <Text style={styles.titulo}>{o.titulo}</Text>
                {o.badge ? <Selo texto={o.badge} tom="laranja" /> : null}
                {o.ativo === false ? <Selo texto={t.admin.inativa} tom="neutro" /> : null}
              </View>
              <Text style={styles.itemSub}>
                {[o.cidade, o.preco != null ? `R$ ${o.preco}` : null].filter(Boolean).join(' · ') || '—'}
              </Text>
            </View>
            <Pressable hitSlop={8} onPress={() => setForm(paraForm(o))} style={styles.iconeBtn}>
              <Ionicons name="create-outline" size={20} color={cores.azul} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => remover(o.id)} style={styles.iconeBtn}>
              <Ionicons name="trash-outline" size={20} color={cores.erro} />
            </Pressable>
          </Cartao>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: espaco.lg, gap: espaco.md },
  sub: { ...tipografia.corpoSuave, color: cores.textoSuave },
  form: { gap: espaco.md },
  switchLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchTexto: { ...tipografia.corpo, color: cores.texto },
  formAcoes: { flexDirection: 'row', gap: espaco.md },
  vazio: { ...tipografia.corpoSuave, color: cores.textoSuave, textAlign: 'center', marginTop: espaco.xl },
  item: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  itemTopo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, flexWrap: 'wrap' },
  titulo: { ...tipografia.subtitulo, color: cores.azulMarinho },
  itemSub: { ...tipografia.corpoSuave, color: cores.textoSuave, marginTop: 2 },
  iconeBtn: { padding: espaco.xs },
});
