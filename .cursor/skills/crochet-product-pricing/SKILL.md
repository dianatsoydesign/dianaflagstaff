---
name: crochet-product-pricing
description: >-
  Prices handmade crochet for local-only Diana's art sales (Flagstaff, Venmo,
  no shipping). Fetches live Michaels Charisma and Bobbiny yarn prices, applies
  Flagstaff AZ tax on supplies, estimates labor, runs Etsy + local + peer-town
  comps, writes docs/pricing/reports, and proposes products.ts price drafts.
  Use when the user asks to price crochet, competitive pricing, Etsy comps,
  target market, Diana's art, or product SKU pricing.
disable-model-invocation: true
---

# Crochet product pricing (Diana's art)

Follow steps **in order**. Read [reference/report-template.md](reference/report-template.md) for output shape.

## 1. Resolve product

- In this repo: read `src/data/products.ts` by `id` or name (sentence case).
- Else: `@docs/pricing/intake.template.yaml` or a copied intake file.
- If ambiguous, ask which product (repo rule: ask-when-unclear).
- Set **`units_per_sku`** and **`unit_label`** per [reference/unit-pricing.md](reference/unit-pricing.md) (e.g. coasters → 4 coasters per SKU).

## 2. Brand context

Read `docs/pricing/dianas-art-context.md` if present; else [reference/brand-defaults.md](reference/brand-defaults.md).

**Local-only:** never price as if you ship. Venmo + pickup + country-store buyer.

## 3. Live yarn prices (every run)

Run:

```bash
node .cursor/skills/crochet-product-pricing/scripts/fetch-live-yarn-prices.mjs
```

Or fetch manually per [reference/live-supplier-prices.md](reference/live-supplier-prices.md).

- **Bobbiny ≫ Charisma** — separate math ([reference/yarn-costing.md](reference/yarn-costing.md)).
- Merge `docs/pricing/costs/<product-id>.yaml` if it exists.
- Flag `price_source: fallback` if fetch fails.

## 4. Flagstaff tax

Per [reference/flagstaff-tax.md](reference/flagstaff-tax.md) and `docs/pricing/defaults.yaml`:

- Tax **materials pretax + tag ($0.90)** — not labor.
- Cite rate source in report.

## 5. Labor hours

Priority: confirmed `costs/*.yaml` → user input → [reference/hours-heuristics.md](reference/hours-heuristics.md).

Set `hours_source`. Ask once: “Does X hours feel right?”

## 6. Cost floor

```
taxable = materials_pretax + tag_usd
flagstaff_tax = taxable × combined_rate
floor = materials_pretax + tag_usd + flagstaff_tax + (hours × hourly_floor_usd)
```

Defaults: `docs/pricing/defaults.yaml`.

## 7. Clientele

Required: personas, seasonality, Flagstaff context, in-person willingness to pay.

## 8. Competitive scan (three lanes)

[reference/comp-rules.md](reference/comp-rules.md):

- **Lane A:** Etsy (3–5), reference only.
- **Lane B:** Flagstaff / northern AZ local (2–4 when findable).
- **Lane C:** Peer towns (1–3): Prescott, Sedona, Williams, etc.

Weight B + C over A when local data exists.

**Summary tables:** two market columns — **online (item + shipping)** vs **local (no shipping)**. See comp-rules “Summary columns”.

## 9. Recommend

Floor / target / stretch:

- **Per sold SKU** — whole dollars for `products.ts`.
- **Per unit** — always show (e.g. **$4.50 per coaster**). See [reference/unit-pricing.md](reference/unit-pricing.md).

Normalize comps to **per unit** when listings are sets. Reconcile comps vs floor vs clientele.

Optional: propose minimal `price` diff in `src/data/products.ts` (per SKU only) — **never commit** unless asked.

## 10. Write report

Save to `docs/pricing/reports/<product-id>-YYYY-MM-DD.md`. Summarize in chat with **per SKU and per unit** ([reference/unit-pricing.md](reference/unit-pricing.md)).

## Examples

```text
Use crochet-product-pricing for product id "coasters". Save report; do not commit.
```

See [examples/coasters-example.md](examples/coasters-example.md) for structure (illustrative numbers).
