"""Gera a logo e os ícones da ViajeBrasil a partir de assets/logo-fonte.png.

Requer Pillow (`pip install Pillow`). Produz:
- assets/logo.png          logo circular completa (mapa + wordmark + slogan),
                           com cantos transparentes — usada na splash e no app.
- assets/icon.png          1024, SÓ o símbolo (mapa do Brasil) sobre fundo branco.
- assets/adaptive-icon.png 1024, símbolo sobre branco com folga (zona segura Android).
- assets/favicon.png       64, símbolo sobre branco.
- public/icons/icon-{192,512}.png  ícones do PWA, símbolo sobre branco.

O recorte do símbolo (frações da arte) foi medido na logo oficial; ajuste em
SIMB_* se a arte mudar. Os ícones NÃO trazem o texto nem a borda do círculo.
"""

import os
from PIL import Image, ImageDraw

BASE = os.path.join(os.path.dirname(__file__), "..")
FONTE = os.path.join(BASE, "assets", "logo-fonte.png")

# Recorte do símbolo (mapa) na arte, em frações 0..1 (medido na logo oficial).
SIMB_L, SIMB_T, SIMB_R, SIMB_B = 0.289, 0.171, 0.742, 0.559
SIMB_PAD = 0.015  # folga ao redor do recorte


def carregar_simbolo(src):
    """Recorta só o mapa e limpa o quase-branco (evita costura no fundo branco)."""
    w, h = src.size
    box = (
        int((SIMB_L - SIMB_PAD) * w),
        int((SIMB_T - SIMB_PAD) * h),
        int((SIMB_R + SIMB_PAD) * w),
        int((SIMB_B + SIMB_PAD) * h),
    )
    sym = src.crop(box).convert("RGB")
    px = sym.load()
    sw, sh = sym.size
    for y in range(sh):
        for x in range(sw):
            r, g, b = px[x, y]
            if r > 238 and g > 238 and b > 238:
                px[x, y] = (255, 255, 255)
    return sym


def icone(simbolo, tam, margem):
    """Símbolo centralizado sobre quadrado branco `tam`, preenchendo (1-2*margem)."""
    util = int(tam * (1 - 2 * margem))
    w, h = simbolo.size
    escala = util / max(w, h)  # preenche a caixa (faz upscale se necessário)
    nw, nh = max(1, round(w * escala)), max(1, round(h * escala))
    s = simbolo.resize((nw, nh), Image.LANCZOS)
    cv = Image.new("RGB", (tam, tam), (255, 255, 255))
    cv.paste(s, ((tam - nw) // 2, (tam - nh) // 2))
    return cv


def main():
    src = Image.open(FONTE).convert("RGBA")
    w, h = src.size

    # 1) Logo completa: máscara circular (cantos transparentes), aparando a borda.
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse((5, 5, w - 6, h - 6), fill=255)
    logo = src.copy()
    logo.putalpha(mask)
    logo.thumbnail((1024, 1024), Image.LANCZOS)
    logo.save(os.path.join(BASE, "assets", "logo.png"), optimize=True)

    # 2) Ícones: só o símbolo (mapa) sobre fundo branco.
    sym = carregar_simbolo(src)
    icone(sym, 1024, 0.10).save(os.path.join(BASE, "assets", "icon.png"), optimize=True)
    icone(sym, 1024, 0.18).save(os.path.join(BASE, "assets", "adaptive-icon.png"), optimize=True)
    icone(sym, 64, 0.08).save(os.path.join(BASE, "assets", "favicon.png"), optimize=True)

    pub = os.path.join(BASE, "public", "icons")
    os.makedirs(pub, exist_ok=True)
    for tam in (192, 512):
        icone(sym, tam, 0.10).save(os.path.join(pub, f"icon-{tam}.png"), optimize=True)

    print("marca gerada: logo.png, icon.png, adaptive-icon.png, favicon.png, public/icons/*")


if __name__ == "__main__":
    main()
