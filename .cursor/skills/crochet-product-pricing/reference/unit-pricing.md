# Per-unit vs per-SKU pricing

The **catalog** (`products.ts`) stores one **`price` per sold SKU** (what the customer pays for one line item). Reports must show **both**:

1. **Per sold SKU** — matches `products.ts` (e.g. set of 4 coasters = one price).
2. **Per unit** — one physical item (e.g. **1 coaster**, **1 wine bottle holder**, **1 hotpad**).

## Resolve `units_per_sku`

Priority:

1. `units_per_sku` + `unit_label` in `docs/pricing/costs/<product-id>.yaml`
2. Intake file
3. Catalog `sizes[].label` (e.g. `"Set of 4"` → 4; `"One pad"` → 1)
4. Default **1** if unclear — ask Diana

## Labels (Diana's art catalog)

| product_id | units_per_sku | unit_label |
|------------|---------------|------------|
| coasters | 4 | coaster |
| hotpads | 1 | hotpad |
| wine-bottle-holders | 1 | wine bottle holder |
| christmas-stockings | 1 | Christmas stocking |
| elf-hat | 1 | elf hat |
| hats | 1 | hat |

## Display formulas

When `units_per_sku = U` (U ≥ 1):

```
per_unit = per_sku / U   # round $ to 2 decimals for display; catalog stays whole $
```

Apply to:

- Current catalog price, floor / target / stretch
- Cost floor total (optional column “per unit”)
- Labor: show **hours per unit** when U > 1 (e.g. 0.5 h per coaster)
- Comps: if listing is a set, add **`comp_per_unit`** = item price ÷ listed quantity (note assumption)

## Summary table (required in every report)

| | Per sold SKU | Per unit (1 {{unit_label}}) |
|---|-------------:|----------------------------:|
| Current catalog | | |
| Cost floor | | |
| Target | | |
| Stretch | | |

## Chat summary

Always include one line: “**$X per SKU** (Y × **$Z per unit**)” when U > 1.
