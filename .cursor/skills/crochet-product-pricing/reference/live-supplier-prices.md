# Live supplier prices

Report-only — not stored in the Next.js app.

## Script (preferred)

```bash
node .cursor/skills/crochet-product-pricing/scripts/fetch-live-yarn-prices.mjs
```

Embed the JSON in the report **Live price snapshot** section with `fetchedAt`.

## Michaels Charisma

- Master SKU: `M10133746`
- `GET https://www.michaels.com/api/product/v2/skus?skuNumbers=M10133746` → color SKUs
- `GET .../sub-skus?skuNumbers=<one-sku>` → `itemPrice.numberPrice` (per skein)
- Product URL: https://www.michaels.com/product/charisma-yarn-by-loops-threads-10133751

Prices are usually consistent across colors; note sale vs `orgPrice` if present.

## Bobbiny Premium 5mm

- `GET https://bobbinycords.us/collections/premium-5mm/products.json?limit=250`
- Use `variants[0].price` (USD string) — typically **$17.90/spool** (108 yd)
- Default reference: median variant; document handle in report

## Report fields

- `charisma_per_skein_usd`, `bobbiny_per_spool_usd`, `fetched_at`, `sources[]`, `price_source: live | fallback`
