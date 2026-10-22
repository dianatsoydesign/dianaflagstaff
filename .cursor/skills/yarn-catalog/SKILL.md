---
name: yarn-catalog
description: Import or repair yarn catalogs, swatches, color families, and product galleries for Diana's crochet website.
---
# Yarn catalog

Use the project copy at `.cursor/skills/yarn-catalog/` as source of truth. Work from the website root.

- Reuse the shared picker and gallery. Preserve supplier names/SKUs in data; use sentence case in UI. Keep supplier family, fiber/care, and inventory adapters separate from other yarn lines.
- Import supplier catalog/photos once and cache local WebPs. Preserve original supplier photos. Crop only picker swatches from actual yarn, excluding labels, white margins, and props. Inspect upright and horizontal skeins separately; save crop overrides so refreshes cannot undo corrections. Version changed URLs if browser/image caches could retain old crops.
- Classify with `scripts/classify-yarn.mjs`: a reviewed supplier-specific override first, recognizable color names next, actual swatch pixels as fallback. Sort every family from lightest to darkest by perceptual lightness, never by hue, name, or supplier order. Never classify black by its faint green cast or call a solid multicolor because of stitch shadows. Flag name/pixel disagreements for visual review; do not silently trust hue arithmetic.
- Review a **labeled, grouped contact sheet of every imported swatch**, not just the first few. Check all families, subtle neutrals, dark colors, pale colors, and true variegated yarns. Save reviewed overrides in `src/data/<yarn>-color-families.json`. New unfamiliar names require review; ask the user when supplier photos and names remain ambiguous.
- Check imported counts, duplicate IDs, valid groups, local asset paths, and known regressions (Black → Neutrals; Really Red → Reds; Amethyst, Plum Purple, Winter Grape → Purples). Run the classifier tests after changes. Verify picker family filters, swatch selection, supplier-photo switching, default pictured color, and cart price/size in-browser.
- Stock scope must match the user: online stock is not local store quantity. Do not claim verified availability or discard colors unless the requested source/threshold is actually checked. No inventory automation unless requested.
- Keep the refresh command and reviewed settings in the repo. Catalog/ordering changes do not authorize production deployment; use `/cf` when deployment is requested.

## Commands (from website root)

- Audit + grouped contact sheet: `node .cursor/skills/yarn-catalog/scripts/audit-catalog.mjs src/data/bernat-blanket-big.json src/data/bernat-color-families.json` (add `--write` after review to save classifications).
- Classifier regressions: `node .cursor/skills/yarn-catalog/scripts/classify-yarn.test.mjs`.
- Bernat refresh: `node scripts/sync-bernat.mjs`. It stops before replacing catalog data if new ambiguous names or suspect crops need review. For another yarn line, pass its own catalog and reviewed-family JSON to the same audit tool.
