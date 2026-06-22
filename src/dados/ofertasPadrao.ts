/**
 * Conteúdo padrão da home (as duas seções) — espelha o fallback de
 * `app/(tabs)/index.tsx`. O admin pode "popular" o banco com estas para já
 * começar com a vitrine atual e então editar à vontade.
 *
 * `secao`: 'destaque' = carrossel "Destino em alta" (topo); 'oferta' = grade.
 */
import type { SecaoHome } from '../tipos';

const foto = (seed: string, w = 800) => `https://picsum.photos/seed/vb-${seed}/${w}/${Math.round(w * 0.66)}`;

export interface OfertaPadrao {
  titulo: string;
  cidade: string;
  preco: number;
  badge: string;
  imagem_url: string;
  ordem: number;
  secao: SecaoHome;
}

export const OFERTAS_PADRAO: OfertaPadrao[] = [
  // Carrossel "Destino em alta"
  { secao: 'destaque', titulo: 'Rio de Janeiro', cidade: '', preco: 189, badge: 'Destino em alta', imagem_url: foto('rio'), ordem: 1 },
  { secao: 'destaque', titulo: 'Salvador', cidade: '', preco: 119, badge: 'Destino em alta', imagem_url: foto('ssa'), ordem: 2 },
  { secao: 'destaque', titulo: 'São Paulo', cidade: '', preco: 149, badge: 'Destino em alta', imagem_url: foto('sao'), ordem: 3 },
  { secao: 'destaque', titulo: 'Florianópolis', cidade: '', preco: 199, badge: 'Destino em alta', imagem_url: foto('floripa'), ordem: 4 },
  // Grade "Ofertas imperdíveis"
  { secao: 'oferta', titulo: 'Rio de Janeiro', cidade: 'Rio de Janeiro – RJ', preco: 189, badge: '20% OFF', imagem_url: foto('rio'), ordem: 1 },
  { secao: 'oferta', titulo: 'Belo Horizonte', cidade: 'Belo Horizonte – MG', preco: 149, badge: '15% OFF', imagem_url: foto('bh'), ordem: 2 },
  { secao: 'oferta', titulo: 'São Paulo', cidade: 'São Paulo – SP', preco: 129, badge: '10% OFF', imagem_url: foto('sao'), ordem: 3 },
  { secao: 'oferta', titulo: 'Salvador', cidade: 'Salvador – BA', preco: 119, badge: '10% OFF', imagem_url: foto('ssa'), ordem: 4 },
];
