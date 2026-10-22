# Shared Flagstaff Charisma stock

Hats require 2 skeins per color; Christmas stockings require 3. Both use the same exact pickup quantities from Michaels store 9608 (Varsity Shopping Center, Flagstaff), fetched once per hourly GitHub run. Shipping stock never qualifies. A color with two skeins can appear for hats while staying hidden for stockings.

All constituent colors in a mixed palette must meet the applicable product threshold. The pictured stockings Multi option uses the existing classic holiday palette (Off White, Pine, Red). Checkout aggregates quantities across hats, stockings, and palettes sharing a color: one hat plus one stocking in the same color needs five skeins in the saved snapshot.

The workflow runs at minute 27 each hour and supports manual publishing or check-only runs. GitHub schedules can be delayed. The endpoint is `/api/cron/charisma-flagstaff-stock`, protected by a dedicated `CHARISMA_STOCK_SECRET`; the same secret must be configured in GitHub and Cloudflare before activation. The complete raw snapshot is saved without expiry in the existing BOBBINY_STOCK namespace under `michaels:charisma:flagstaff:9608`.

Keep the bundled `src/data/charisma-stock-bootstrap.json` snapshot for first loads and storage outages. Successful updates replace choices; failed checks preserve the last successful choices, without emptying the picker. Local previews share an hourly refresh and retry failures after a minute. The two pages poll the lightweight cached website endpoint once per minute, not Michaels directly.

This new workflow is separate from the legacy online-availability Mac checker, which remains unchanged for other consumers. It checks the configured catalog SKU set. Both stock scripts and ingestion reject wrong stores, incomplete/duplicate batches, invalid quantities, old push timestamps, and replayed snapshots. A failed batch never advances the previous check timestamp.

## Verification

```sh
node --test scripts/charisma-flagstaff-inventory.test.mjs
node scripts/push-charisma-flagstaff-stock.mjs --check-only
# Refresh initial fallback before a release:
node scripts/push-charisma-flagstaff-stock.mjs --check-only --write-bootstrap
```

To activate, add matching CHARISMA_STOCK_SECRET values in GitHub and Cloudflare, deploy after Diana approves publishing, merge the workflow to the default branch, run an initial publishing refresh, and verify both live product pickers. Cat cave still uses its separate Bernat check and three-skein threshold. Supplier stock checks do not reserve yarn; preserved choices reflect the last successful check during an outage.
