/**
 * Encaminhamento para a white label da Buson (canal oficial de venda).
 *
 * A compra de passagens é finalizada no canal oficial fornecido pela Buson.
 * O app apenas leva o cliente final até lá — sem reproduzir, adaptar ou
 * embutir o sistema do parceiro, em conformidade com o contrato Buson.
 */
import { Linking } from 'react-native';
import { WHITE_LABEL } from './config';

/**
 * Monta a URL da white label (canal oficial), marcando a origem como o app.
 * `secao` vai como utm_campaign (ex.: 'onibus', 'aereo') para rastreio.
 */
export function linkWhiteLabel(secao?: string, medium = 'app'): string {
  const query = new URLSearchParams({ utm_source: 'app', utm_medium: medium });
  if (secao) query.set('utm_campaign', secao);
  return `${WHITE_LABEL.url}/?${query.toString()}`;
}

/** Abre a white label (canal oficial) no navegador do dispositivo. */
export async function abrirWhiteLabel(secao?: string): Promise<void> {
  await Linking.openURL(linkWhiteLabel(secao));
}

/**
 * Base da busca de ônibus da Buson (deep-link). Domínio confirmado pela URL
 * real de busca da white label. Configurável por `EXPO_PUBLIC_BUSON_URL`.
 */
const BUSON_ONIBUS = (
  process.env.EXPO_PUBLIC_BUSON_URL ?? 'https://viajebrasil.buson.com.br'
).replace(/\/$/, '');

/** Normaliza "Goiânia" + "GO" no slug da Buson: "goiania-go" (sem acento). */
function slugCidadeUf(cidade: string, uf: string): string {
  const c = cidade
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const u = uf
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  return u ? `${c}-${u}` : c;
}

export interface BuscaOnibus {
  origemCidade: string;
  origemUf: string;
  destinoCidade: string;
  destinoUf: string;
  /** Data de ida em AAAA-MM-DD (opcional). */
  dataIda?: string;
}

/**
 * Monta o deep-link da busca de ônibus na Buson, no formato real:
 * `/passagem-de-onibus/{origem-uf}/{destino-uf}?ida=AAAA-MM-DD&isPartner=true`.
 * A white label abre já na rota com origem/destino (e data) preenchidos.
 */
export function linkBuscaOnibus(b: BuscaOnibus): string {
  const origem = slugCidadeUf(b.origemCidade, b.origemUf);
  const destino = slugCidadeUf(b.destinoCidade, b.destinoUf);
  const query = new URLSearchParams({
    isPartner: 'true',
    utm_source: 'app',
    utm_medium: 'app',
    utm_campaign: 'onibus',
  });
  if (b.dataIda) query.set('ida', b.dataIda);
  return `${BUSON_ONIBUS}/passagem-de-onibus/${origem}/${destino}?${query.toString()}`;
}

/** Abre a busca de ônibus da Buson já na rota com os dados preenchidos. */
export async function abrirBuscaOnibus(b: BuscaOnibus): Promise<void> {
  await Linking.openURL(linkBuscaOnibus(b));
}

/** O checkout encaminha para a white label (medium = checkout). */
export function linkCheckoutOficial(): string {
  return linkWhiteLabel(undefined, 'checkout');
}

/** Abre o checkout oficial (white label) no navegador do dispositivo. */
export async function abrirCheckoutOficial(): Promise<void> {
  await Linking.openURL(linkCheckoutOficial());
}
