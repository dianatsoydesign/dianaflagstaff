# Hours heuristics (Diana's art catalog)

**Diana’s rank (longest → shortest):** christmas-stockings → elf-hat → hats ≈ hotpads → wine-bottle-holders → coasters (fastest **per coaster**; set of 4 ≈ **2 h**). Wine **2–3 h** per holder (confirmed); adjust elf/hat/pad hours when confirmed.

Crochet time only — not shopping. Set `hours_source: agent_estimate` until Diana confirms (`confirmed` in `costs/*.yaml`).

| product_id | Default hours | Notes |
|------------|--------------:|-------|
| christmas-stockings | 6 | Ribbed cuff, tassel |
| wine-bottle-holders | 2.5 | **Diana: 2–3 h** (mid for costing) |
| elf-hat | 4 | Stripes (agent estimate — confirm) |
| hats | 3 | Adult M-ish + pom |
| hotpads | 3 | One pad |
| coasters | 2 | **Diana: 30 min × 4** |

When estimating, give a **± range** and list assumptions (colors, size).

## Charisma skeins (when `costs/*.yaml` empty)

| product_id | skeins_used |
|------------|------------|
| christmas-stockings | 1.15 |
| hats | 1.4 |
| elf-hat | 0.9 (use waste_factor 1.1) |

See repo `docs/pricing/costs/` for seeded values.
