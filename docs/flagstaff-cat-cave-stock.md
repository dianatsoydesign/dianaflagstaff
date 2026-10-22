# Cat cave yarn availability

Cat cave colors require at least 3 skeins of that exact Bernat Blanket Big SKU at Michaels Flagstaff, store 9608 (Varsity Shopping Center). Shipping stock is never used. Colors with no pickup inventory record are stored as unknown (`null`) and hidden. Wrong-store, malformed, missing-SKU, and duplicate-SKU responses fail the entire refresh, preserving the prior snapshot and its original timestamp.

The GitHub workflow runs hourly at minute 17, away from the busiest start of the hour. GitHub schedules can be delayed or dropped; they are not precise timers. The workflow also supports a manual check-only run to test access from GitHub before activation. It uses Node's built-in fetch, without installing project dependencies or rebuilding the site.

The authenticated `/api/cron/bernat-stock` endpoint saves the complete snapshot to the existing Cloudflare `BOBBINY_STOCK` namespace under `michaels:bernat:flagstaff:9608`. It accepts only the current catalog's full SKU set, the correct store, nonnegative integer quantities or explicit unknowns, and a check timestamp within the past five minutes. Older/replayed snapshots cannot overwrite newer ones. A failed refresh never advances the timestamp.

The picker reads the saved snapshot, checks for changes every minute, and clears expired choices after two hours. Missing, invalid, or expired snapshots pause selection with “Yarn availability is being updated.” The stock response is not cached by the browser. Checkout checks the current saved snapshot again and rejects unavailable choices, including insufficient quantities for multiple cat caves sharing the same color (3 skeins per cave).

This is a supplier stock check, not a reservation. Michaels can sell yarn between refreshes, and separate customer orders do not reserve or subtract supplier inventory.

## Validate

```sh
node --test scripts/bernat-inventory.test.mjs
node scripts/push-bernat-stock.mjs --check-only
```

## Activate

1. Ensure GitHub repository access is working before configuring the scheduled job.
2. Run the check-only workflow from GitHub to verify Michaels allows requests from the GitHub runner. Local success does not establish runner access.
3. Set one new random `BERNAT_STOCK_SECRET` in Cloudflare Worker secrets and the matching GitHub Actions repository secret. Keep it out of committed files. This credential authorizes only this stock endpoint.
4. Deploy the website through the existing Cloudflare deployment procedure after Diana approves publishing. Until an initial successful stock push arrives, the new picker intentionally pauses selection.
5. Put the workflow and checker files on the repository's default branch, run a publishing refresh manually, and verify the live cat cave picker against the resulting counts. Hourly schedules operate only from the default branch. Verify the next scheduled run succeeds too.

Changing `src/data/bernat-blanket-big.json` requires deploying the updated catalog and using the same catalog version in the scheduled checker. Mismatched SKU sets reject the push rather than showing unverified colors.
