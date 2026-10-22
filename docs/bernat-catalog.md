# Bernat Blanket Big catalog

Cat cave: $50, one size, 20 inches long, 44 inches around, 8-inch opening.
Main photo includes Diana's cat; the empty cave is the second product photo.

Run `node scripts/sync-bernat.mjs` from the project root to refresh Michaels colors, cropped swatches, and local WebP yarn photos. Existing photos are reused. The importer shares Charisma's swatch crop and pixel-based color analysis. The picker includes multicolors.

Availability filtering is intentionally disabled at Diana's request. All catalog colors are selectable; no Flagstaff quantities have been verified. The `michaels-bernat:` SKU prefix prevents accidental use of Charisma's online inventory check. Do not describe catalog availability as verified store stock. A future store check should use Flagstaff store 9608 and require at least three skeins per color.

Catalog source: https://www.michaels.com/product/bernat-blanket-big-yarn-10750420
Care source: https://www.michaels.com/product/bernat-blanket-big-yarn-D734747S

Color families now combine a visual review of the whole catalog, supplier color names, and pixel-based ordering within each family. Reviewed families are saved in `src/data/bernat-color-families.json` and survive refreshes. The reusable importer/audit workflow is `.cursor/skills/yarn-catalog/SKILL.md`.
