# Competitive pricing rules

Primary recommendation = **what Diana would charge in Flagstaff**, local pickup / Venmo.

## Lane A — Etsy / online (reference)

- 3–5 comps; record item price + shipping → **total online**.
- Exclude: digital patterns, machine-made, dropship.
- **Do not** set local target = Etsy total.

Search: product-specific phrases from intake or catalog description.

## Lane B — Flagstaff & nearby local

- 2–4 comps when findable: Flagstaff makers, farmers markets, gift shops, northern AZ, country-store-adjacent gifts, local Instagram/Facebook.
- Columns: seller, price, channel (in-person / local pickup), link or “observed”, **local_read**.

If thin: state gaps; name substitutes (Target, Michaels decor).

## Lane C — Peer towns

- 1–3 comps: Prescott, Sedona, Williams, similar tourism/mountain towns.
- Label `lane: peer_town`; sanity-check Flagstaff, don’t auto-undercut.

## Table

One table with `lane` ∈ `etsy` | `flagstaff_local` | `peer_town` plus **local_read** (high / in-line / low vs your target).

Columns: **listing price**, **qty in listing** (e.g. 4), **comp_per_unit**, **local_read vs your per-unit or per-SKU target** (state which you compare).

Example: Etsy set of 4 coasters $20 → **$5.00 per coaster**.

## Summary columns (catalog / batch tables)

Every summary table must split **market** into two columns — do not blend:

| Header | Source lanes | What to record |
|--------|--------------|----------------|
| **Market charges (online, incl. shipping)** | Lane A (Etsy + shipped web shops) | **Item price + shipping** → total; also show **per unit** when SKU qty > 1 |
| **Market charges (local, no shipping)** | Lane B + C (Flagstaff, peer towns, in-person / local pickup) | **Shelf or booth price only** — no shipping; Venmo/country-store comparable |

Derive each from comp medians or a stated range (low–typical–high). Note yarn/material mismatch (cotton Etsy vs Bobbiny).

**Your Diana's art target** should align with **local, no shipping** — not online total.

## Weighting

When Lane B or C has data: weight **≥** Lane A for **target** price. Lane A validates “what buyers pay on the web all-in.”

## Bobbiny SKUs

Note when comps use cheaper acrylic/cotton cord. Don’t match low Etsy if materials are premium Bobbiny.
