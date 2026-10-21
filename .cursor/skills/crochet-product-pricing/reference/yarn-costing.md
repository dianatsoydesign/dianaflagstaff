# Yarn costing

## Lines

| Line | Products | Live price |
|------|----------|------------|
| `charisma` | christmas-stockings, hats, elf-hat | Michaels `itemPrice.numberPrice` per skein |
| `bobbiny-premium-5mm` | coasters, hotpads, wine-bottle-holders | Shopify `variants[].price` per 108 yd spool |

**Bobbiny ≫ Charisma.** Never use skein math for Bobbiny.

## Charisma materials pretax

```
materials_pretax = skeins_used × price_per_skein × waste_factor
```

Default `waste_factor` for multi-color: 1.1 (`docs/pricing/defaults.yaml`).

## Bobbiny materials pretax

Prefer `bobbiny_spool_fraction` in `costs/<id>.yaml`:

```
materials_pretax = bobbiny_spool_fraction × live_per_spool_usd
```

Or use `materials_usd_estimate` override when Diana gives a dollar guess.

Typical spool fractions (seed — adjust after confirm):

| product_id | spool_fraction |
|------------|----------------|
| coasters (set of 4) | 0.32 |
| hotpads | 0.28 |
| wine-bottle-holders | 0.45 |

Wine holders usually highest Bobbiny $ among cord SKUs.
