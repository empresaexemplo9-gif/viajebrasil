/**
 * Envio de e-mail via Resend (https://resend.com). Sem RESEND_API_KEY, apenas
 * registra no log do servidor (modo desenvolvimento) — o fluxo nunca quebra.
 *
 * Variáveis:
 *   RESEND_API_KEY — chave da Resend
 *   EMAIL_FROM     — remetente, ex.: "DRAP Business <noreply@seu-dominio>"
 *                    (em teste, pode usar "DRAP Business <onboarding@resend.dev>")
 */
export interface Email {
  para: string;
  assunto: string;
  html: string;
}

export function emailAtivo(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function enviarEmail(e: Email): Promise<boolean> {
  const chave = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? 'DRAP Business <onboarding@resend.dev>';
  if (!chave) {
    console.info(`[email] (sem RESEND_API_KEY) para=${e.para} assunto="${e.assunto}"`);
    return false;
  }
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: e.para, subject: e.assunto, html: e.html }),
    });
    if (!resp.ok) {
      console.error('[email] Resend falhou:', resp.status, await resp.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] erro ao enviar:', err);
    return false;
  }
}
