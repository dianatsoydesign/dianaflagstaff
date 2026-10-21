# Diana's art • made in Flagstaff

Handmade crochet shop site for Diana :  fall/winter pieces sold locally (country store, friends & family). **Local pickup only · Venmo for payment · no shipping.**

Brand name: **Diana's art • made in Flagstaff**.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Cloudflare Workers via OpenNext

## Pages

| Route | Audience | Purpose |
| --- | --- | --- |
| `/` | Public | Home |
| `/shop` | Public | Catalog + size/yarn selection + “Request a make” (free-pattern board) |
| `/about` | Public | About Diana |
| `/maker/orders` | Private | Fulfillment list (password-gated) :  customers never see this |

## Run locally

```bash
npm install
cp .env.example .env.local   # set MAKER_PASSWORD if you want
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

Default maker password (from `.env.example`): `DianasOrders!`.

Local orders are saved to `data/orders/orders.json` on disk so they survive refresh while you develop.

Optional: copy `.dev.vars.example` to `.dev.vars` if you use Cloudflare bindings during local preview.

## Maker orders

- **Local (`npm run dev`)**: file on disk :  `data/orders/orders.json`
- **Cloudflare (live site)**: Cloudflare KV binding `ORDERS_KV` (orders survive redeploys)
- **Fallback**: in-memory only if neither disk nor KV is available (orders can vanish after idle :  avoid for real use)

Aggregated open lines read like:

`3 × Heather Beanie :  Adult M in Forest Heather`

Email / Google Sheet can be added later; they are not required to put the site online.

## Deploy to Cloudflare (public URL)

The shop is wired for **Cloudflare Workers** (Cloudflare’s hosting for this kind of app) via `@opennextjs/cloudflare` (OpenNext).

**There is no permanent public shop URL until Diana publishes (or pastes deploy keys for an agent to publish).** A temporary preview may exist briefly; treat it as disposable until she claims it or redeploys under her own account.

Diana already has a **free Cloudflare account**. She does **not** need to paste API secrets into Cursor to go live :  pick one path below.

### Path A :  Claim a temporary preview (fastest, if the link still works)

If an agent just published a preview, open the claim link from that chat (Cloudflare dashboard → claim preview). Sign in with her free Cloudflare account. That moves the preview into her account so it does not vanish when the temporary window ends.

### Path B :  Publish from her own computer (no Cursor secrets)

1. Install Node.js, then in this project folder run `npm install`.
2. Log into Cloudflare in the terminal (opens a browser :  no API token to copy anywhere):

   ```bash
   npx wrangler login
   ```

3. Create the order notebook once, then paste the printed **id** and **preview_id** into `wrangler.jsonc` under `kv_namespaces` (replace any old placeholders):

   ```bash
   npm run cf:kv:create
   ```

4. Publish:

   ```bash
   npm run deploy
   ```

   Wrangler prints a public `*.workers.dev` URL when it succeeds. That URL is the live shop.

### Path C :  Let an agent publish later (optional secrets)

Only if she prefers not to run commands herself:

1. Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token**.
2. Use the **Edit Cloudflare Workers** template (Workers + KV is enough).
3. Copy the token once, plus **Account ID** (Workers overview → right sidebar).
4. Paste into Cursor environment secrets as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then ask the hosting agent to run `npm run deploy`.

Useful extras:

| Command | What it does |
| --- | --- |
| `npm run preview` | Build + run the Workers version on your machine |
| `npm run cf-typegen` | Refresh Cloudflare TypeScript types |

Change the maker password on the live site with:

```bash
npx wrangler secret put MAKER_PASSWORD
```

(or edit `vars.MAKER_PASSWORD` in `wrangler.jsonc` for the shared light password).

## Shop behavior

- Multi-item **cart** (inquiry cart) → submit request for local pickup
- Per-item **sizes** and **yarn swatch** colors (swap SVGs in `public/yarn-swatches/` for real yarn photos)
- Yarn **stock** in `src/lib/yarn-stock.ts` :  live for Bobbiny (coasters, hotpads, wine holders) and Charisma (hats); stub data for the rest

## Live yarn stock

| Yarn | Products | Hourly check |
| --- | --- | --- |
| Bobbiny Premium 5mm | Coasters, hotpads, wine holders | Cloudflare cron → `scheduled` in `custom-worker.ts` |
| [Charisma by Loops & Threads](https://www.michaels.com/product/charisma-yarn-by-loops-threads-10133751) | Hats | Diana's Mac → `/api/cron/charisma-stock` |

Out-of-stock colors are hidden from the picker. If a check fails, the shop keeps the last known stock.

**Charisma runs from the Mac** because Michaels blocks requests from Cloudflare's network. One-time setup after deploying:

```bash
bash scripts/install-charisma-push.sh https://<your-site>.workers.dev
```

It asks for `CRON_SECRET` (same value as `npx wrangler secret put CRON_SECRET`), then runs hourly while the Mac is awake. Log: `~/Library/Logs/diana-flagstaff-charisma.log`. Remove with `--uninstall`.

**New Charisma colors** at Michaels show up after re-syncing the color list (also refreshes the swatch images in `public/yarn-swatches/charisma/`):

```bash
node scripts/sync-charisma.mjs
```
- Pattern requests include designer credit, pattern name/link, and “reference photo :  not my work” labeling

## What Diana still needs to provide

- Real Venmo handle (placeholder `@loopedlocal`)
- Product photos of her finished pieces
- Yarn swatch photos
- Local yarn shop supplier URLs (for live stock)
- Free-pattern links + designer names + permitted reference images for “Request a make”
- One publish action (claim preview, `wrangler login` + deploy, or optional API token for an agent)
