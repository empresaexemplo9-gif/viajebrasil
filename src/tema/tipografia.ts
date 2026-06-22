/** Escala tipográfica do app. */
export const tipografia = {
  // Destaque / heros
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.6 },
  tituloGrande: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  titulo: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  subtitulo: { fontSize: 18, fontWeight: '700' as const },
  secao: { fontSize: 16, fontWeight: '700' as const },
  corpo: { fontSize: 15, fontWeight: '500' as const },
  corpoSuave: { fontSize: 14, fontWeight: '500' as const },
  legenda: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.2 },
  // Microtexto de rótulos/eyebrows (uppercase aplicado na tela)
  rotuloMicro: { fontSize: 11, fontWeight: '800' as const, letterSpacing: 0.6, lineHeight: 16 },
  botao: { fontSize: 15, fontWeight: '800' as const, letterSpacing: 0.2 },
  preco: { fontSize: 22, fontWeight: '800' as const, letterSpacing: -0.5 },
  precoGrande: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
} as const;
