# Pricing report template

File: `docs/pricing/reports/<product-id>-YYYY-MM-DD.md`

## 1. Summary

- Product name (sentence case), catalog id, **`units_per_sku`**, **`unit_label`**
- **Pricing table (required)** — per [unit-pricing.md](unit-pricing.md):

| | Per sold SKU | Per unit |
|---|-------------:|---------:|
| Current catalog | | |
| Cost floor | | |
| Target | | |
| Stretch | | |

- One-line PDP positioning

## 2. Live price snapshot

- `fetched_at`
- Charisma $/skein (source)
- Bobbiny $/spool (variant/handle)
- `price_source`

## 3. Cost floor

| Line | USD |
|------|-----|
| Materials (pretax) | |
| Tag | 0.90 |
| Flagstaff tax (rate, source) | |
| Labor (hours × floor) | |
| **Total floor** | |

- `hours_guesstimate` (total for SKU), **hours per unit** if U > 1, `hours_source`, assumptions

## 4. Clientele & local channel

Personas, seasonality, Flagstaff context.

## 5. Competitive comps

Detail tables by lane (A/B/C) with **item price**, shipping (Lane A only), **comp_per_unit**, local_read.

**Summary (required):**

| Listing | Market charges (online, incl. shipping) | Market charges (local, no shipping) |
|---------|----------------------------------------:|------------------------------------:|
| per SKU / per unit | from Lane A totals | from Lane B + C |

## 6. Reconciliation

Paragraph: comps vs floor vs local buyers. Bobbiny premium note if applicable.

## 7. Recommendation

Floor / target / stretch (whole $). Optional size-variant note.

## 8. Catalog draft (optional)

Minimal `products.ts` price diff — not applied unless user asks to commit.

## 9. Confirm hours

“Does X hours feel right?” + optional `costs/<id>.yaml` update proposal.
