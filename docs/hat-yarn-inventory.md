# Hat yarn inventory

Hats include standard Charisma plus four additional Michaels lines in `src/data/hat-yarns.json`: Big Twist Winter Bulky Stripes, Charisma Heather, Caron Birthday Cupcakes, and Charisma Tweed Stripe. Stockings retain only standard Charisma.

Refresh catalog/photos: `node scripts/sync-hat-yarns.mjs`. Reviewed supplier texture swatches and classifications are saved in `src/data/hat-yarn-color-families.json`; new names stop import for review. Original supplier images remain beside local WebP copies in `public/yarn-images/hat-yarns/`. The supplier's Cappuccino photo is turquoise; retain its supplier name and SKU rather than substituting a brown image.

Verify pickup counts without publishing: `node scripts/push-charisma-flagstaff-stock.mjs --check-only --write-bootstrap`.

The existing store 9608 refresh now includes all 80 SKUs. Michaels labels 2 pickup skeins Limited Quantity and displays a numeric count at 3. Hat colors require at least 3 verified pickup skeins to be shown or ordered; missing counts and 0–2 stay hidden. A hat still reserves the existing 2 skeins per item; availability threshold and yarn consumption are separate. Checkout checks both eligibility and combined quantity. Shipping inventory never qualifies.

No inventory automation was newly installed, and no production deployment was performed.
