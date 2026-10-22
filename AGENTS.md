<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product video defaults

- PDP gallery order: product photos, product videos, then supplier yarn/color photos (including Bobbiny).
- Product videos autoplay muted with inline playback when their gallery slide is selected. Keep playback controls available.
- Preserve the original video and export edits to a new versioned filename. Keep yarn hue, white balance, framing, and stitch detail intact; correct temporal exposure flicker without blending moving product details.
- Keep deployed video assets below Cloudflare's 25 MiB per-file limit; aim for under 20 MB.

## Product recommendation associations

- Maintain `src/data/product-recommendations.ts` when adding products. Products can belong to multiple explicit recommendation groups; these are independent of shop categories.
- If a new product's association or grouping is uncertain, ask Diana before assigning it. You may propose a grouping, but wait for her answer before implementing that uncertain association.
- Do not guess associations or backfill recommendations with unrelated products. Unassigned products show no recommendation section until their grouping is confirmed.

- Approved exception: cat cave may recommend two random listed products per page visit until another listed product joins the pets recommendation group; then use pet matches automatically.

## Accessibility requirements

- Always follow `.cursor/rules/accessibility.mdc` for website ideas, requests, content, and code changes, including in agents that do not load Cursor rules automatically.
- Target WCAG 2.2 AA. Proactively flag accessibility barriers in Diana's requests before implementing them, explain the impact, and recommend an accessible alternative. Verify changed functionality and disclose gaps; do not claim full-site compliance from limited checks.
