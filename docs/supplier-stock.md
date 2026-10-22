# Shared supplier availability

- Cat cave: Bernat Blanket Big, at least 3 skeins of a color at Michaels Flagstaff store 9608.
- Hats: Charisma, at least 2 skeins per color at the same store.
- Christmas stockings: Charisma, at least 3 skeins per color at the same store.
- Coasters, placemats, hotpads, and wine bottle holders: Bobbiny Premium 5mm, at least 1 skein per color in the supplier's online stock.

Hats and stockings share one raw Charisma quantity snapshot and one hourly GitHub run, then apply their separate thresholds. All Bobbiny products share one raw Bobbiny snapshot and one hourly GitHub run. Bernat has its own run. Every mixed Charisma palette requires all constituent colors to meet that product's threshold. Checkout combines yarn requirements across hats and stockings sharing a color and rejects colors reported unavailable by the saved snapshots.

The workflows run at minutes 17 (Bernat), 27 (Charisma), and 37 (Bobbiny). GitHub schedules can be delayed. Each workflow tests and verifies supplier access in check-only mode on pull requests; publishing runs only happen on the schedule or a manual run. There are no per-product supplier checks. Browser pickers poll the website's lightweight saved results once per minute.

Bobbiny's Shopify collection feed supplies product identities and sold-out flags, but purchasability can permit backorders. The Bobbiny job reads actual quantities from each available product's `bobbinycords-inventory` element, handling both “70 in stock” and “Low stock: 3 left.” A malformed or missing quantity fails the refresh and preserves the previous snapshot. Up to four requests run concurrently; this work runs on GitHub, outside Cloudflare's request limits. Missing collection products are recorded as unknown and hidden, and colors explicitly sold out are recorded as zero.

Every supplier has a bundled, verified snapshot for first loads. Successful updates replace the saved snapshot; failed checks retain the last verified choices, without an expiry cutoff. UI request failures keep the displayed choices. Neither catalog defaults nor online shipping inventory substitute for verified Michaels pickup counts. A confirmed zero/insufficient quantity hides that color; a genuine absence of eligible colors can still produce an empty picker. Saved supplier stock is not a reservation and can become outdated during an outage.

## Activation

Configure matching GitHub repository and Cloudflare Worker secrets:

- BERNAT_STOCK_SECRET
- CHARISMA_STOCK_SECRET (shared by hats and stockings)
- BOBBINY_STOCK_SECRET (shared by all Bobbiny products)

Deploy through the existing Cloudflare procedure after Diana approves publishing; merge the workflows to the default branch; then run an initial publishing refresh and verify the next scheduled refresh. The old Worker Bobbiny cron is removed to prevent duplicate checks. The former Bobbiny GitHub endpoint-ping workflow is replaced with the exact-count job. The legacy Charisma Mac online-stock push is unchanged, but should be disabled after the new workflows are live if it has no remaining consumers.

Refresh bundled snapshots before a release with each supplier's push script in `--check-only --write-bootstrap` mode. Each script refuses partial/malformed source data, and the authenticated ingestion endpoints enforce complete catalog coverage and recent original check timestamps. All data lives in the existing BOBBINY_STOCK namespace, under separate supplier keys.

See `flagstaff-cat-cave-stock.md` and `flagstaff-charisma-stock.md` for supplier-specific details.
