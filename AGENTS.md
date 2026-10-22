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
