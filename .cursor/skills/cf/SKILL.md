---
name: cf
description: Deploy Diana's art to Cloudflare Workers (production). Use when the user says /cf, /ship, deploy to cloudflare, push live, or push to production.
---

# Deploy to Cloudflare

Run from the project root (requires network):

```bash
npm run cf
```

Do **not** run `npm run deploy` directly from this folder — the apostrophe in the path breaks esbuild. `npm run cf` rsyncs to `/tmp/diana-crochet-deploy` (excluding `.next`, `.open-next`, `data/orders`) and deploys from there.

When the user asks you to deploy, run `npm run cf` yourself and report the result.

The production Worker is **`diana-flagstaff`**. Keep `name` in `wrangler.jsonc` in sync — changing it without renaming the Worker on Cloudflare first creates a second Worker.
