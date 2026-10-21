---
name: pattern-yarn-size-pricing
description: >-
  Extracts per-size yarn usage from a crochet pattern URL or file, then scales
  retail prices from one anchor size using fixed labor+tag plus yarn-proportional
  variable retail. Uses pattern size names from the source. Use when Diana gives
  a pattern link, yarn requirements by size, yards per size, or asks to price
  other sizes from one size price.
disable-model-invocation: true
---

# Pattern yarn size pricing

Scale **retail** prices across pattern sizes when yardage differs. Follow steps **in order**.

Related: full cost + comps → [crochet-product-pricing](../crochet-product-pricing/SKILL.md). Entry pointer → [dianas-art-pricing](../dianas-art-pricing/SKILL.md).

## 1. Inputs

Required:

- Pattern **URL** and/or repo **file path**
- **Anchor**: size label exactly as the pattern names it (e.g. `Adult`) + **priceUsd** (whole dollars you charge for that size)

Optional:

- **fixed_usd**: dollars that stay flat per item (labor + tag, no yarn). See [reference/fixed-component.md](reference/fixed-component.md).
- **product_id**: only if Diana asks for a **separate** shop catalog mapping step later

Do **not** rename pattern sizes to shop catalog labels unless she explicitly asks for catalog mapping.

## 2. Extract yarn by size

- URLs: fetch and read the **Yarn requirements** (or equivalent) section.
- Files: read local PDF, markdown, or text Diana provides.

Parsing heuristics: [reference/extraction-patterns.md](reference/extraction-patterns.md).

Build a list: `{ size, amount, unit }` per row. Prefer **yards**. If the source only gives grams or skeins, convert only when the same page states yards per skein or grams per skein.

**Validate**

- Size count matches value count in parenthetical lists.
- Quote the source snippet in your reply.
- If multiple conflicting tables exist, ask which one (repo rule: ask-when-unclear).

## 3. Resolve fixed_usd

[reference/fixed-component.md](reference/fixed-component.md).

If Diana did not give `fixed_usd`, show any cost-floor estimate from `docs/pricing/costs/` + `docs/pricing/defaults.yaml`, explain it is **not** the same as retail margin, and **ask her to confirm or override** before calculating.

## 4. Calculate (script)

From project root, pipe JSON to the calculator:

```bash
node .cursor/skills/pattern-yarn-size-pricing/scripts/calc-size-prices.mjs --format markdown <<'EOF'
{
  "source": "https://example.com/pattern",
  "unit": "yards",
  "fixedUsd": 12,
  "anchor": { "size": "Adult", "priceUsd": 25 },
  "yarnBySize": [
    { "size": "Baby", "amount": 50 },
    { "size": "Toddler", "amount": 70 },
    { "size": "Child", "amount": 80 },
    { "size": "Teen", "amount": 90 },
    { "size": "Adult", "amount": 100 }
  ]
}
EOF
```

Use `--format json` when saving YAML. Never hand-roll rounded prices if the script can run.

**Formula**

```text
variable_pool = anchor_price - fixed_usd
price(size) = round( fixed_usd + variable_pool × (amount(size) / amount(anchor)) )
```

`round` = `Math.round` (whole dollars, same idea as hotpad `customSizeUnitPrice` in `src/lib/custom-size.ts`).

## 5. Deliver in chat

Use this shape:

```markdown
## Pattern yarn size pricing

**Source:** [title](url)

**Extracted yarn:** (short quote)

| Size | Yards | Price |
|------|------:|------:|

**Anchor:** {size} · ${price}
**Fixed (labor + tag):** ${fixed_usd}
```

Pattern size names only in the main table.

## 6. Optional snapshot

If Diana wants it saved:

`docs/pricing/size-scaling/<slug>-YYYY-MM-DD.yaml`

Keys under `prices` use **pattern size names**. Include `source`, `yarn_by_size`, `anchor`, `fixed_usd`, `unit`.

## 7. Catalog mapping (opt-in)

Only when she asks to align with `src/data/products.ts`: add a **second** table mapping shop size ids to pattern sizes. Ask when counts or names do not line up.

Do **not** commit `products.ts` unless she asks.

## Example

[examples/beginner-bulky-beanie.md](examples/beginner-bulky-beanie.md)

## Trigger phrase

```text
Use pattern-yarn-size-pricing. Pattern: <url>. Anchor: Adult $25. Fixed: $12.
```
