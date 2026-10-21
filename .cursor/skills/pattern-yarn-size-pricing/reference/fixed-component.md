# Fixed USD (labor + tag)

The **variable** part of retail scales with yarn. The **fixed** part stays the same for every size.

## Formula

```text
variable_pool = anchor_price_usd - fixed_usd
price(size) = round( fixed_usd + variable_pool × (amount(size) / amount(anchor)) )
```

- **anchor_price_usd**: what Diana charges for the anchor size today.
- **fixed_usd**: labor + tag (and any other cost she treats as flat per item), **excluding** yarn that scales with size.

If `fixed_usd >= anchor_price_usd`, the script warns: variable pool is zero or negative; all sizes collapse to about the same price unless she lowers fixed or raises anchor.

## Resolution order

1. **Diana states it** in the request (`fixed: $12`, `use $15 fixed for labor and tag`).
2. **Suggest from costs yaml** (not auto-apply without confirmation):
   - Read `docs/pricing/costs/<product-id>.yaml` if she named a product.
   - Read `docs/pricing/defaults.yaml`:
     ```text
     suggested_floor = hours_guesstimate × hourly_floor_usd + tag_usd_per_product
     ```
   - Label this **cost floor**, not retail fixed. Her anchor price usually includes margin and may be below the floor in dollar terms (e.g. hobby pricing). Ask: “Use $X for scaling, or pick another fixed amount?”
3. **Ask once**: “What dollar amount should stay the same for every size (labor + tag, no yarn)?”

## What fixed_usd is not

- Not Flagstaff tax on yarn (tax is not in this scaling shortcut unless Diana asks to extend the skill later).
- Not live Charisma/Bobbiny dollar cost per size (that is [crochet-product-pricing](../../crochet-product-pricing/SKILL.md)).
- Not a substitute for comps or floor checks when launching a new SKU.

## Pure yarn ratio (fallback)

Only if Diana explicitly asks to ignore fixed labor:

```text
price(size) = round( anchor_price × (amount(size) / amount(anchor)) )
```

Default mode remains fixed + variable pool.
