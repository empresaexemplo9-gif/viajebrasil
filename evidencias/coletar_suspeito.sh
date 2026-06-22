#!/usr/bin/env bash
# Coleta defensiva do site suspeito — rode na SUA máquina (aqui a rede é bloqueada).
# Acessa apenas páginas/assets PÚBLICOS. Nada de brute force/exploração.
set -euo pipefail

SITE="${1:-https://viajebrasilpassagens.com.br}"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
OUT="evidencias/site_$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT/assets"
echo "Coletando $SITE -> $OUT"

# 1) Cabeçalhos (assinatura Vercel/Next?) e HTML
curl -sSIL -A "$UA" "$SITE/" | tee "$OUT/headers.txt" >/dev/null
curl -sSL  -A "$UA" "$SITE/" -o "$OUT/index.html"

# 2) URLs de bundles/CSS (Next costuma usar /_next/static/...)
grep -oE '/_next/static/[^"'"'"' ]+\.(js|css)|/[^"'"'"' ]+\.(js|css)' "$OUT/index.html" \
  | sort -u > "$OUT/bundles.txt" || true

# 3) Baixa cada bundle e tenta o source map (.map) — prova quase definitiva
while read -r p; do
  [ -z "$p" ] && continue
  f="$OUT/assets/$(echo "$p" | sed 's#[/?=&]#_#g')"
  curl -sSL -A "$UA" "$SITE$p" -o "$f" || true
  curl -sSfL -A "$UA" "$SITE$p.map" -o "$f.map" 2>/dev/null && echo "SOURCE MAP: $p.map" || true
done < "$OUT/bundles.txt"

# 4) Assets de marca para comparar hash com os meus (evidencias/hashes_assets.txt)
for a in favicon.ico favicon.png icon.png apple-touch-icon.png logo.png manifest.json; do
  curl -sSfL -A "$UA" "$SITE/$a" -o "$OUT/assets/site_$a" 2>/dev/null || true
done

# 5) Procura MINHAS impressões digitais dentro do que baixou
echo "==== FINGERPRINTS encontrados no site suspeito ===="
grep -RInaE 'apibuson|carga_geral|leads_aereo|current_tenant_id|cliente_token|atendimento_mensagens|home_ofertas|set_config\(.?app\.current_tenant|auth\.php|buscar-viagens\.php|criar-reserva\.php|download-dabpe\.php|DABPE|Realizando Sonhos|Sua próxima viagem começa aqui|Maior Oferta de Linhas|#6D4FB0|/seed/vb-|EXPO_PUBLIC_' "$OUT" || echo "(nenhum fingerprint forte encontrado no HTML/bundles)"

# 6) CRÍTICO: a MINHA ref/anon key de Supabase apareceria aqui? (se sim: acesso indevido)
echo "==== Supabase refs/anon keys nos bundles ===="
grep -RInaoE 'https://[a-z0-9-]+\.supabase\.co|eyJ[A-Za-z0-9_-]{20,}' "$OUT" | sort -u || echo "(nenhuma)"

# 7) Hashes dos assets baixados (compare com evidencias/hashes_assets.txt)
echo "==== sha256 dos assets do site ===="
sha256sum "$OUT"/assets/site_* 2>/dev/null || true

echo "OK. Tudo salvo em $OUT (preserve a pasta com a data)."
