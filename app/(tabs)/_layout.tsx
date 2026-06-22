import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, alturaBarraAbas } from '../../src/tema';
import { t } from '../../src/i18n';
import { useCarrinho } from '../../src/contextos/CarrinhoContext';
import { useAutenticacao } from '../../src/contextos/AutenticacaoContext';

type Icone = keyof typeof Ionicons.glyphMap;

export default function LayoutAbas() {
  const { itens } = useCarrinho();
  const insets = useSafeAreaInsets();
  const { carregando, ehStaff, ehAdmin, modo } = useAutenticacao();

  // Aguarda a sessão para não "piscar" antes de decidir o redirecionamento.
  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.verde} />
      </View>
    );
  }
  // Staff em modo interno cai direto na sua área (sem a poluição do cliente).
  if (ehStaff && modo === 'interno') {
    return <Redirect href={ehAdmin ? '/admin' : '/painel'} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.azul,
        tabBarInactiveTintColor: cores.textoClaro,
        tabBarStyle: {
          backgroundColor: cores.superficie,
          // Altura considera a área segura inferior (notch/home indicator).
          height: alturaBarraAbas + insets.bottom + 8,
          paddingBottom: insets.bottom + 10,
          paddingTop: 8,
        },
        // lineHeight evita o corte do texto da label.
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', lineHeight: 15 },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.abas.inicio,
          tabBarIcon: ({ color, size }) => icone('home', color, size),
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: t.abas.buscar,
          tabBarIcon: ({ color, size }) => icone('search', color, size),
        }}
      />
      <Tabs.Screen
        name="atendimento"
        options={{
          title: t.abas.atendimento,
          tabBarIcon: ({ color, size }) => icone('chatbubbles', color, size),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: t.abas.reservas,
          tabBarIcon: ({ color, size }) => (
            <View>
              {icone('bookmark', color, size)}
              {itens.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{itens.length}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: t.abas.perfil,
          tabBarIcon: ({ color, size }) => icone('person', color, size),
        }}
      />
    </Tabs>
  );
}

const icone = (nome: Icone, cor: string, tamanho: number) => (
  <Ionicons name={nome} size={tamanho} color={cor} />
);

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: cores.laranja,
    borderRadius: 999,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeTexto: { color: cores.textoInverso, fontSize: 10, fontWeight: '800' },
});
