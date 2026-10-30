# Image protection

Prepared locally on 2026-10-30. Not deployed or enabled in Cloudflare domain settings by this change.

## Site Worker

- Hotlink protection covers gallery, product, yarn, and about image files, including WebP/AVIF and the Next image endpoint. Exact own-domain checks prevent lookalike-domain referrers from passing.
- Direct links and requests without Referer stay available for privacy tools and ordinary sharing crawlers. Referrers can be spoofed; this is a deterrent, not image access control.
- Dedicated `/social/` cards remain public, including external previews. Google/Bing/DuckDuckGo referrers are allowed for search discovery; other external image embeds get 403. Some embedding features on Pinterest or other sites may consequently stop working, though links using social cards remain available.
- The Worker denies self-identified GPTBot, ClaudeBot, and CCBot requests except robots.txt. User-agent strings can be spoofed. Google-Extended is a robots directive, not a separate HTTP crawler; never block Googlebot to enforce it.
- robots.txt asks GPTBot, ClaudeBot, CCBot, and Google-Extended not to crawl. Search and user-triggered fetch bots remain allowed. This cannot separate every mixed-purpose crawler or guarantee content exclusion from all AI uses.
- Cloudflare Worker rate limiting allows 600 protected image requests per IP per minute, per Cloudflare location. Limits are approximate; shared IPs share the allowance. 429 replies use Retry-After: 60 and no-store. Pages, API requests, JS, and public sharing cards are outside this limiter. Tune from observed logs if normal users are affected.
- `assets.run_worker_first` is essential: otherwise static image requests can bypass the Worker. This increases Worker invocations for those paths and can affect usage/cost; check account limits before deploying.
- No original files are removed or made private by these measures. Public images remain downloadable.

## Managed Cloudflare settings still to finish

The CLI login has Workers write permissions and zone read permissions, not domain-security write permissions. Dashboard sign-in is needed to inspect the zone plan/current configuration and enable managed controls.

1. Security > Settings > Configure AI bot policies: review Training = Block on all pages; keep Search and Agent allowed under the recommended crawler scope. Mixed-purpose Training+Search crawlers can also be blocked by this managed setting, so review its search impact before activation.
2. Review Bot Fight Mode on Free, or Super Bot Fight Mode on paid plans. Basic Bot Fight Mode affects the entire domain and cannot be skipped via WAF rules; test supplier inventory POSTs, APIs, checkout/order requests, accessibility tools, and legitimate preview crawlers before enabling. Prefer granular rules when available. Do not upgrade or buy a plan without instruction.
3. Do not also enable blanket Scrape Shield Hotlink Protection without review: it only covers GIF/ICO/JPG/JPEG/PNG, not WebP/AVIF, and can interfere with image search and social embedding. The narrower Worker policy above preserves dedicated sharing cards.

## Deployment and validation

Use the existing `/cf` deployment workflow only when deployment is requested. Then verify same-origin and blank-referrer images return 200; foreign embeds return 403; social cards still return 200; robots.txt matches the approved policy; training-agent requests return 403; and normal gallery browsing/order submission/supplier sync remain functional. Review Cloudflare 429/403 events for false positives. Never call code checks proof of live protection.

Run `node --test scripts/image-protection.test.mjs` and `npx tsc --noEmit` before deployment.

## References

- https://developers.cloudflare.com/workers/examples/hot-link-protection/
- https://developers.cloudflare.com/workers/static-assets/binding/
- https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
- https://developers.cloudflare.com/bots/get-started/bot-fight-mode/
- https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/
- https://developers.cloudflare.com/waf/tools/scrape-shield/hotlink-protection/
- https://developers.openai.com/api/docs/bots
- https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- https://commoncrawl.org/ccbot
