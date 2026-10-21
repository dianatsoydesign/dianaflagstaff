# Diana's art pricing

Rerunnable **pricing reports** for handmade crochet :  local-only sales (Flagstaff, Venmo, country store). Not wired into the shop app.

## Run

In Cursor, from this repo:

```text
Use crochet-product-pricing for product id "coasters". Save report; propose products.ts price change; do not commit.
```

Or copy [`intake.template.yaml`](intake.template.yaml) for a product not in the catalog yet.

The full workflow lives in [`.cursor/skills/crochet-product-pricing/`](../../.cursor/skills/crochet-product-pricing/SKILL.md). [`.cursor/skills/dianas-art-pricing/SKILL.md`](../../.cursor/skills/dianas-art-pricing/SKILL.md) is the short entry point for agents.

## What each run does

1. Fetches **live** Michaels Charisma and Bobbiny Premium 5mm prices (report snapshot only).
2. Applies **Flagstaff AZ sales tax** on yarn + $0.90 tag (not on labor).
3. Estimates or reads **hours** and **material usage** from [`costs/`](costs/) or heuristics.
4. **Competitive scan:** Etsy (reference), Flagstaff/local, similar peer towns.
5. Writes [`reports/<product-id>-YYYY-MM-DD.md`](reports/) with **per sold SKU** and **per unit** prices (e.g. $16 set = $4 per coaster).
6. Optionally proposes a `price` edit in [`src/data/products.ts`](../src/data/products.ts) :  **per SKU only**; you approve before any commit.

## Files

| File | Purpose |
|------|---------|
| [`defaults.yaml`](defaults.yaml) | Hourly floor, tag cost, tax rate fallback |
| [`dianas-art-context.md`](dianas-art-context.md) | Brand and channel context |
| [`intake.template.yaml`](intake.template.yaml) | New product intake |
| [`costs/*.yaml`](costs/) | Per-SKU hours / yarn usage (confirm over time) |
| [`size-scaling/`](size-scaling/) | Optional snapshots from pattern-yarn-size-pricing |
| [`reports/`](reports/) | Dated pricing reports |

## Live prices helper (optional)

From the project root:

```bash
node .cursor/skills/crochet-product-pricing/scripts/fetch-live-yarn-prices.mjs
```

Prints JSON for pasting into a report. Does not touch the website.
