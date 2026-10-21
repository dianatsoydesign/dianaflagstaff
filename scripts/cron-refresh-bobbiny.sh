#!/usr/bin/env bash
# Refresh Bobbiny stock in KV.
# The Worker already does this hourly (custom-worker.ts). Use this script only as a
# backup from an outside scheduler (GitHub Actions, cron-job.org, etc.).
#
# Required env vars:
#   SITE_URL      :  e.g. https://art-by-diana.workers.dev
#   CRON_SECRET   :  matches the CRON_SECRET set in Cloudflare Workers env vars
#
# Example cron (GitHub Actions):
#   on:
#     schedule:
#       - cron: "0 * * * *"
#   jobs:
#     refresh:
#       runs-on: ubuntu-latest
#       steps:
#         - run: bash scripts/cron-refresh-bobbiny.sh
#           env:
#             SITE_URL: ${{ vars.SITE_URL }}
#             CRON_SECRET: ${{ secrets.CRON_SECRET }}

set -euo pipefail

: "${SITE_URL:?SITE_URL is required}"
: "${CRON_SECRET:?CRON_SECRET is required}"

echo "Refreshing Bobbiny stock at $(date -u +%Y-%m-%dT%H:%M:%SZ)..."

response=$(curl -s -w "\n%{http_code}" \
  -X POST \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${SITE_URL}/api/cron/refresh-bobbiny")

body=$(echo "$response" | head -n -1)
code=$(echo "$response" | tail -n 1)

echo "HTTP $code: $body"

if [ "$code" != "200" ]; then
  echo "ERROR: refresh failed!" >&2
  exit 1
fi
