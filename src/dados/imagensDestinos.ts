/**
 * Fotos reais (Wikimedia Commons) dos destinos usados na vitrine da home e nos
 * padrões do admin. URLs diretas de `upload.wikimedia.org` (servem a imagem e
 * permitem hotlink). Créditos/licença ao lado de cada uma.
 *
 * Fonte única: tanto a home (`app/(tabs)/index.tsx`) quanto os padrões de oferta
 * (`ofertasPadrao.ts`) consomem daqui, então site e admin ficam iguais.
 */
export const URLS_DESTINOS: Record<string, string> = {
  // Rio de Janeiro – Corcovado e Pão de Açúcar — Matthias Bethke / CC BY-SA 4.0
  'rio-de-janeiro':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/20170825_Blick_auf_den_Corcovado_und_den_P%C3%A3o_de_A%C3%A7%C3%BAcar.jpg/1920px-20170825_Blick_auf_den_Corcovado_und_den_P%C3%A3o_de_A%C3%A7%C3%BAcar.jpg',
  // Salvador – Pelourinho — Paul R. Burley / CC BY-SA 4.0
  salvador:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Pelourinho_Salvador_Bahia_2018-0601.jpg/1920px-Pelourinho_Salvador_Bahia_2018-0601.jpg',
  // São Paulo – Terraço Itália e Copan — Webysther Nunes / CC BY-SA 4.0
  'sao-paulo':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Webysther_20150427002640_-_Edif%C3%ADcios_Terra%C3%A7o_It%C3%A1lia_e_Copan.jpg/1920px-Webysther_20150427002640_-_Edif%C3%ADcios_Terra%C3%A7o_It%C3%A1lia_e_Copan.jpg',
  // Florianópolis – Ponte Hercílio Luz — Chamuscajr / CC BY-SA 4.0
  florianopolis:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Ponte_Herc%C3%ADlio_Luz_Florian%C3%B3polis.jpg/1920px-Ponte_Herc%C3%ADlio_Luz_Florian%C3%B3polis.jpg',
  // Belo Horizonte – Praça da Liberdade — Alexandre Marini / CC BY-SA 3.0
  'belo-horizonte':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Pra%C3%A7a_da_Liberdade%2C_Belo_Horizonte%2C_Minas_Gerais.jpg/1920px-Pra%C3%A7a_da_Liberdade%2C_Belo_Horizonte%2C_Minas_Gerais.jpg',
  // Fortaleza – Praia de Iracema — Mayra P. Munerato / CC BY-SA 3.0
  fortaleza:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Praia_de_Iracema_-_Fortaleza_CE.jpg/1920px-Praia_de_Iracema_-_Fortaleza_CE.jpg',
  // Recife – Marco Zero / Recife Antigo — Hans von Manteuffel / CC BY-SA 4.0
  recife:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bairro_de_Recife_Antigo_com_Marco_Zero.jpg/1920px-Bairro_de_Recife_Antigo_com_Marco_Zero.jpg',
  // Foz do Iguaçu – Cataratas — Esin Üstün / CC BY 2.0
  'foz-do-iguacu':
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Iguazu_Falls-_Brazil_%2814858965267%29.jpg/1920px-Iguazu_Falls-_Brazil_%2814858965267%29.jpg',
  // Natal – Ponte Newton Navarro — Marinelson Almeida / CC BY 2.0
  natal:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Ponte_Newton_Navarro_-_Natal_-_Brasil_%2833616371311%29.jpg/1920px-Ponte_Newton_Navarro_-_Natal_-_Brasil_%2833616371311%29.jpg',
  // Gramado – Centro — Augusto Janiski Junior / CC BY 2.0
  gramado:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/GRAMADO_-_RIO_GRANDE_DO_SUL_-_BRASIL_BY_AUGUSTO_JANISCKI_JUNIOR_%2814445422406%29.jpg/1920px-GRAMADO_-_RIO_GRANDE_DO_SUL_-_BRASIL_BY_AUGUSTO_JANISCKI_JUNIOR_%2814445422406%29.jpg',
};

/** URL real do destino, com fallback gracioso (Lorem Picsum) por slug. */
export function imagemDestino(slug: string): string {
  return URLS_DESTINOS[slug] ?? `https://picsum.photos/seed/vb-${slug}/900/594`;
}
