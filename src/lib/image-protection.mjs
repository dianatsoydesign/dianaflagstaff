/** Image protection is a deterrent, not authentication or DRM. */
const OWN_HOSTS = new Set(['dianaflagstaff.com', 'www.dianaflagstaff.com']);
const SEARCH_REFERRERS = new Set(['google.com', 'www.google.com', 'images.google.com', 'bing.com', 'www.bing.com', 'duckduckgo.com', 'www.duckduckgo.com']);
const TRAINING_AGENTS = /(?:^|[^a-z0-9-])(?:GPTBot|ClaudeBot|CCBot)(?:[^a-z0-9-]|$)/i;

/** @param {URL} url */
export function isProtectedImage(url) {
  let path;
  try { path = decodeURIComponent(url.pathname); } catch { return false; }
  if (path.startsWith('/social/')) return false;
  if (path === '/_next/image') {
    const source = url.searchParams.get('url');
    if (!source) return false;
    try {
      const image = new URL(source, url);
      return (image.origin === url.origin || OWN_HOSTS.has(image.hostname)) && isProtectedImage(image);
    } catch { return false; }
  }
  return /^\/(?:art|products|yarn-images|yarn-swatches|about)\//.test(path) && /\.(?:avif|webp|jpe?g|png|gif|svg|heic)$/i.test(path);
}

/** Exact host matching prevents a lookalike hostname bypass. @param {Request} request */
export function isForeignHotlink(request) {
  const referrer = request.headers.get('referer');
  // Direct links, privacy tools, and sharing crawlers may legitimately omit Referer.
  if (!referrer) return false;
  try {
    const source = new URL(referrer);
    const target = new URL(request.url);
    if (!['http:', 'https:'].includes(source.protocol)) return true;
    return source.hostname !== target.hostname && !OWN_HOSTS.has(source.hostname) && !SEARCH_REFERRERS.has(source.hostname);
  } catch { return true; }
}

/** @param {Request} request @param {{ IMAGE_RATE_LIMITER?: { limit(options:{key:string}):Promise<{success:boolean}> } }} env */
export async function imageProtection(request, env) {
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const url = new URL(request.url);
  // Let blocked crawlers read the policy that explains the restriction.
  if (url.pathname !== '/robots.txt' && TRAINING_AGENTS.test(request.headers.get('user-agent') ?? '')) {
    return new Response('AI training crawling is not permitted. See /robots.txt.', { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
  }
  if (!isProtectedImage(url)) return null;
  if (isForeignHotlink(request)) return new Response('Embedding this image on another website is not permitted.', { status: 403, headers: { 'Cache-Control': 'private, no-store' } });
  // Use Cloudflare's trusted connecting IP, never a client-supplied forwarding list.
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip && env.IMAGE_RATE_LIMITER) {
    try {
      const { success } = await env.IMAGE_RATE_LIMITER.limit({ key: `images:${ip}` });
      if (!success) return new Response('Too many image requests. Please try again in a minute.', { status: 429, headers: { 'Retry-After': '60', 'Cache-Control': 'private, no-store' } });
    } catch {
      // A limiter outage must not turn the public gallery into an error page.
      console.warn('Image rate limiter unavailable');
    }
  }
  return null;
}
