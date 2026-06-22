import React, { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espaco, raio, tipografia } from '../tema';

interface PromptEvento {
  prompt: () => void;
  userChoice: Promise<unknown>;
  preventDefault?: () => void;
}

/**
 * Botão que dispara a instalação do PWA. Aparece SOMENTE na web em Android/iOS
 * (em desktop/Windows não renderiza nada). No Android usa o evento nativo
 * `beforeinstallprompt`; no iOS mostra as instruções (Compartilhar → Adicionar
 * à Tela de Início), pois o iOS não permite instalação programática.
 */
export function BotaoInstalarApp() {
  const [suportado, setSuportado] = useState(false);
  const [ios, setIos] = useState(false);
  const [evento, setEvento] = useState<PromptEvento | null>(null);
  const [instrucoes, setInstrucoes] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const w = window as unknown as {
      matchMedia?: (q: string) => { matches: boolean };
      addEventListener: (t: string, cb: (e: unknown) => void) => void;
      removeEventListener: (t: string, cb: (e: unknown) => void) => void;
    };
    const nav = navigator as unknown as { userAgent?: string; standalone?: boolean };
    const ua = (nav.userAgent || '').toLowerCase();
    const ehIos = /iphone|ipad|ipod/.test(ua);
    const ehAndroid = /android/.test(ua);
    const movel = ehIos || ehAndroid;
    const jaInstalado =
      w.matchMedia?.('(display-mode: standalone)')?.matches === true || nav.standalone === true;

    if (!movel || jaInstalado) return; // desktop/Windows ou já instalado → não mostra

    setIos(ehIos);
    setSuportado(true);

    const aoPrompt = (e: unknown) => {
      (e as PromptEvento).preventDefault?.();
      setEvento(e as PromptEvento);
    };
    w.addEventListener('beforeinstallprompt', aoPrompt);
    return () => w.removeEventListener('beforeinstallprompt', aoPrompt);
  }, []);

  if (!suportado) return null;

  const aoTocar = async () => {
    if (evento) {
      evento.prompt();
      try {
        await evento.userChoice;
      } catch {
        /* ignora */
      }
      setEvento(null);
      return;
    }
    setInstrucoes((v) => !v); // iOS (ou Android sem prompt disponível): instruções
  };

  return (
    <View style={styles.area}>
      <Pressable style={styles.botao} onPress={aoTocar}>
        <Ionicons name="download-outline" size={18} color={cores.textoInverso} />
        <Text style={styles.texto}>Instalar app</Text>
      </Pressable>
      {instrucoes && (
        <Text style={styles.hint}>
          {ios
            ? 'No Safari: toque em Compartilhar e em "Adicionar à Tela de Início".'
            : 'No navegador: abra o menu (⋮) e toque em "Instalar app".'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  area: { gap: espaco.sm, marginTop: espaco.md },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: cores.verde,
    borderRadius: raio.pill,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  texto: { ...tipografia.botao, color: cores.textoInverso },
  hint: { color: cores.textoInverso, opacity: 0.85, fontSize: 12, fontWeight: '600', maxWidth: 320 },
});
