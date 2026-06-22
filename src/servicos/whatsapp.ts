/**
 * Monta um link `wa.me` a partir de um telefone (mantém só dígitos e assume DDI
 * 55 do Brasil quando ausente). Retorna `null` se for curto demais.
 */
export function linkWhatsApp(telefone: string, texto?: string): string | null {
  const digitos = (telefone || '').replace(/\D/g, '');
  if (digitos.length < 10) return null;
  const comDDI = digitos.startsWith('55') ? digitos : `55${digitos}`;
  const query = texto ? `?text=${encodeURIComponent(texto)}` : '';
  return `https://wa.me/${comDDI}${query}`;
}
