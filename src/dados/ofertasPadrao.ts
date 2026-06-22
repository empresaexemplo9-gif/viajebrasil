/**
 * Conteúdo padrão da home (as duas seções) — espelha o fallback de
 * `app/(tabs)/index.tsx`. O admin pode "popular" o banco com estas para já
 * começar com a vitrine atual e então editar à vontade.
 *
 * `secao`: 'destaque' = carrossel "Destino em alta" (topo); 'oferta' = grade.
 */
import type { SecaoHome } from '../tipos';
import { imagemDestino } from './imagensDestinos';

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
  { secao: 'destaque', titulo: 'Rio de Janeiro', cidade: '', preco: 189, badge: 'Destino em alta', imagem_url: imagemDestino('rio-de-janeiro'), ordem: 1 },
  { secao: 'destaque', titulo: 'Foz do Iguaçu', cidade: '', preco: 259, badge: 'Destino em alta', imagem_url: imagemDestino('foz-do-iguacu'), ordem: 2 },
  { secao: 'destaque', titulo: 'Salvador', cidade: '', preco: 119, badge: 'Destino em alta', imagem_url: imagemDestino('salvador'), ordem: 3 },
  { secao: 'destaque', titulo: 'Florianópolis', cidade: '', preco: 199, badge: 'Destino em alta', imagem_url: imagemDestino('florianopolis'), ordem: 4 },
  { secao: 'destaque', titulo: 'Natal', cidade: '', preco: 169, badge: 'Destino em alta', imagem_url: imagemDestino('natal'), ordem: 5 },
  // Grade "Ofertas imperdíveis"
  { secao: 'oferta', titulo: 'São Paulo', cidade: 'São Paulo – SP', preco: 129, badge: '15% OFF', imagem_url: imagemDestino('sao-paulo'), ordem: 1 },
  { secao: 'oferta', titulo: 'Belo Horizonte', cidade: 'Belo Horizonte – MG', preco: 149, badge: '15% OFF', imagem_url: imagemDestino('belo-horizonte'), ordem: 2 },
  { secao: 'oferta', titulo: 'Recife', cidade: 'Recife – PE', preco: 139, badge: '10% OFF', imagem_url: imagemDestino('recife'), ordem: 3 },
  { secao: 'oferta', titulo: 'Fortaleza', cidade: 'Fortaleza – CE', preco: 159, badge: '10% OFF', imagem_url: imagemDestino('fortaleza'), ordem: 4 },
  { secao: 'oferta', titulo: 'Gramado', cidade: 'Gramado – RS', preco: 219, badge: '12% OFF', imagem_url: imagemDestino('gramado'), ordem: 5 },
];
