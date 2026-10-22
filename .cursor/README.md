# Cursor agent context (Diana's art shop)

This folder keeps **project-local** rules and skills so agents working in this repo do not depend on Diana's Cursor account or personal `~/.cursor/skills/` copy. **Always save new agent context here** (see [`rules/repo-local-context.mdc`](rules/repo-local-context.mdc)).

## Always-on rules

| Rule | What it governs |
| --- | --- |
| [`rules/repo-local-context.mdc`](rules/repo-local-context.mdc) | Skills, rules, and docs live in the repo |
| [`rules/ask-when-unclear.mdc`](rules/ask-when-unclear.mdc) | Ask before guessing which UI/data the user means |
| [`rules/sentence-case.mdc`](rules/sentence-case.mdc) | Copy, headings, product names, yarn color display |
| [`rules/no-em-dash.mdc`](rules/no-em-dash.mdc) | No em dashes in site copy or new repo prose |
| [`rules/no-orphaned-words.mdc`](rules/no-orphaned-words.mdc) | No single word alone on the last line |
| [`rules/product-images.mdc`](rules/product-images.mdc) | `object-contain`, no crop/zoom on product photos |
| [`rules/size-selection.mdc`](rules/size-selection.mdc) | Shared `SizePicker` patterns |

## Skills (workflows)

| Skill | When to use |
| --- | --- |
| [`skills/cf/SKILL.md`](skills/cf/SKILL.md) | Deploy production (`npm run cf`) |
| [`skills/dianas-art-pricing/SKILL.md`](skills/dianas-art-pricing/SKILL.md) | Entry point for pricing a catalog product |
| [`skills/crochet-product-pricing/SKILL.md`](skills/crochet-product-pricing/SKILL.md) | Full pricing run (yarn fetch, comps, reports) |
| [`skills/pattern-yarn-size-pricing/SKILL.md`](skills/pattern-yarn-size-pricing/SKILL.md) | Pattern yardage by size → scale prices from one anchor size |
| [`skills/square-product-photo/SKILL.md`](skills/square-product-photo/SKILL.md) | Square AI product photos in `public/products/` |
| [`skills/remove-background/SKILL.md`](skills/remove-background/SKILL.md) | Transparent PNG cutouts (Charisma swatches, etc.) |

Use `skills/yarn-catalog/SKILL.md` when importing yarn catalogs or fixing swatches and color sorting.

## Repo docs agents should know

- [`../README.md`](../README.md) — stack, local dev, deploy, Charisma cron on Mac
- [`../docs/pricing/`](../docs/pricing/) — brand context, costs, dated pricing reports
- [`../docs/free-animations.md`](../docs/free-animations.md): free GIFs and short animations safe for the shop
- [`../src/data/products.ts`](../src/data/products.ts) — catalog, prices, images, sizes, yarns
- [`../node_modules/next/dist/docs/`](../node_modules/next/dist/docs/) — this Next.js version differs from older guides (see root `AGENTS.md`)

## Product photos

- Gallery files live under `public/products/<product-id>/`.
- After new images, update `imageSrc` / gallery entries in `products.ts`.
- Framing: square-product-photo skill. Background removal: `.rembg-venv` at repo root + remove-background skill.

## Deploy note

The folder path contains an apostrophe; use **`npm run cf`** (rsync to `/tmp`) — not raw `npm run deploy` from this path.

Cloudflare Worker name: **`diana-flagstaff`**. Custom domains: `dianaflagstaff.com` and `www.dianaflagstaff.com`.
