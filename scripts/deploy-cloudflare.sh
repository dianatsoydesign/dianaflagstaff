#!/usr/bin/env bash
# Deploy from a path without an apostrophe :  esbuild breaks in "Diana's crochet website".
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="/tmp/diana-crochet-deploy"

echo "→ Syncing project to ${DEST}"
mkdir -p "${DEST}"
rsync -a --delete \
  --exclude ".next" \
  --exclude ".open-next" \
  --exclude ".wrangler" \
  --exclude "data/orders" \
  --exclude ".git" \
  "${ROOT}/" "${DEST}/"

echo "→ Building and deploying to Cloudflare"
(cd "${DEST}" && npm run deploy)

echo "→ Done"
