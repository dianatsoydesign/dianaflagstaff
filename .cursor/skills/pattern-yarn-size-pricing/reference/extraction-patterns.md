# Extracting yarn by pattern size

Goal: a parallel list of **size labels** and **amounts** from the pattern source. Keep labels exactly as written (e.g. `Baby`, `Toddler`, not shop ids).

## MJ's Off the Hook (blog)

Common block:

```text
Baby (Toddler, Child, Teen, Adult)
...
50 (70, 80, 90, 100) yds
```

Steps:

1. First parenthetical line → split on commas → trim → size names.
2. Line with `yds` or `yards` → extract parenthetical numbers `50 (70, 80, 90, 100)` → same order as sizes.
3. Confirm counts match.

Sizing headers like `## Baby:` / `## Adult:` confirm names but yardage usually lives in the requirements block.

## Generic parenthetical pair

Look for two lines near each other:

- `SizeA (SizeB, SizeC, ...)`
- `N1 (N2, N3, ...) yds` or `grams` or `g`

Regex hints (adjust to page text):

- Sizes: `\(([^)]+)\)` on a line that lists size words (not stitch counts).
- Amounts: `(\d+)\s*(?:\(\s*[\d,\s]+\))?\s*(?:yds?|yards|g|grams?)`

## Tables (Ravelry-style paste, PDF text)

Markdown or plain tables: first column size, column header `Yardage` / `Yards` / `Amount`.

When columns are skeins only, note skein count per size; convert to yards only if the pattern states yards per skein on the same page.

## Skein count per size

Example: `1 (1, 1, 2) skeins` with a size list. Treat as **relative** usage if yards are missing:

- Use skein counts as the `amount` field and set `"unit": "skeins"` in JSON for the script.
- Prefer finding yardage elsewhere on the page before relying on skeins alone.

## Grams per size

Use grams as `amount` with `"unit": "grams"` only when **every** size is in grams. Do not mix grams and yards in one run without converting.

Conversion to yards (only when stated):

```text
yards = grams × (yards_per_skein / grams_per_skein)
```

If conversion data is missing, ask Diana or leave amounts in grams and label the unit in the output table.

## Validation checklist

- [ ] Same number of sizes and amounts
- [ ] Anchor size string matches one extracted `size` (case-insensitive compare in script; display pattern casing)
- [ ] One primary requirements block chosen; no duplicate conflicting lists
- [ ] Source quote copied into chat or snapshot YAML

## When fetch fails

Grow-gated or ad-blocked blog text: ask Diana to paste the yarn requirements into a repo file (e.g. `docs/pricing/size-scaling/sources/<slug>.txt`) and read that file instead.
