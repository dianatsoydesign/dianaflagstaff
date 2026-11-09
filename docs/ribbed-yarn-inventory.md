# Ribbed hat and headband yarn inventory

Approved scope: Caron Simply Soft solids, Bernat Softee Baby, Red Heart Super Saver solids, Caron Groovy Cloud Cakes, original Cloud Cakes, Cinnamon Swirl Cakes, Sweetie Cakes, Baby Cakes, and Big Twist Living. Facets and Toffee Cakes are excluded because their suggested hooks are 6 mm.

The existing Flagstaff job at minute 27 refreshes `MICHAELS_FLAGSTAFF_CATALOG`, which combines the original chunky-hat catalog and `ribbed-yarns.json`. It writes the existing authenticated snapshot and uses the same store 9608 validation, null quantity handling, and last verified snapshot fallback. No separate schedule or online shipping fallback is added. Chunky-hat and stocking product catalogs remain separate.

Both ribbed products offer a Michaels color only when at least 3 verified pickup skeins are available. Each item consumes 1 skein. Checkout combines demand by SKU across both ribbed products and existing Michaels products, rejecting requests above the verified quantity. The original photographed Ivory Tweed has no Michaels SKU and retains its existing catalog availability. Red Heart Burgundy uses its actual Michaels SKU once the new catalog is approved.

The import retains only numeric store SKUs with single-skein pickup minimum and increment. Online-only nonnumeric variants do not qualify for Flagstaff stock checks. Supplier SKU, canonical color name, fiber content, and supplier photos remain linked. Diana approved all imported supplier swatches and photos on November 9, 2026. Approved originals and WebPs are stored in `public/yarn-images/ribbed-yarns/`; review candidates remain in `work/ribbed-yarn-review-v1/`.

Refresh candidates: `node scripts/prepare-ribbed-yarns.mjs`. Review every swatch and preserve reviewed families in `src/data/ribbed-yarn-color-families.json` before replacing the catalog. Verify inventory locally with `node scripts/push-charisma-flagstaff-stock.mjs --check-only --write-bootstrap`. Never run the stock push without `--check-only` during local-only work.

Tests: `node --test scripts/ribbed-inventory.test.mjs scripts/charisma-flagstaff-inventory.test.mjs scripts/bernat-inventory.test.mjs` and the yarn classifier regression suite.

## Hobby Lobby and supplier photo policy

Hobby Lobby Tweed I Love This Yarn (8 colors) and Yarn Bee Soft & Sleek (47 colors) are stored separately in `ribbed-hobby-lobby-yarns.json`. Both ribbed PDPs share these catalog-only options. No Hobby Lobby stock endpoint is called and no Hobby Lobby SKU enters the Michaels cron catalog. Soft & Sleek is Diana's specifically requested exception to the earlier 6 mm exclusion.

Candidate refresh: `node scripts/prepare-ribbed-hobby-lobby-yarns.mjs`. This resolves each variant's complete Amplience image set, then keeps only reviewed eligible yarn/material photos.

The global supplier-image audit reviewed 1,111 gallery references (1,040 unique images) across seven yarn catalogs and removed 88 finished-product references. `yarn-gallery-image-review.json` records source and cached-asset decisions. All supplier importers apply `reviewedSupplierYarnImages` before importing images; unknown sources stop for review. The shared PDP gallery additionally filters supplier color images through the same reviewed policy. The full eligible gallery is retained, including all three Birch Bark yarn views. Diana's product photo/video galleries are unchanged.
