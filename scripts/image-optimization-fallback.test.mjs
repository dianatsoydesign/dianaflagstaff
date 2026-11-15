import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithImageFallback } from '../src/lib/image-optimization-fallback.mjs';
import { imageProtection } from '../src/lib/image-protection.mjs';
const url = 'https://dianaflagstaff.com/_next/image?url=%2Fyarn-images%2Fa.webp&w=96&q=75';
const request = () => new Request(url);

test('resize exceptions serve original bytes with the same bindings and request', async () => {
  const req = request(), ctx = {}, env = { IMAGES: {}, ASSETS: {} }, seen = [];
  const handler = { fetch: async (r, e, c) => {
    seen.push(e); assert.equal(r, req); assert.equal(c, ctx); assert.equal(e.ASSETS, env.ASSETS);
    if (e.IMAGES) throw new Error('resize unavailable');
    return new Response('original bytes', { headers: { 'Content-Type': 'image/webp' } });
  } };
  const response = await fetchWithImageFallback(req, env, ctx, handler);
  assert.equal(await response.text(), 'original bytes');
  assert.equal(response.headers.get('content-type'), 'image/webp');
  assert.equal(seen.length, 2); assert.equal(env.IMAGES, seen[0].IMAGES);
});
test('5xx image responses retry once without optimization', async () => {
  let calls = 0;
  const response = await fetchWithImageFallback(request(), { IMAGES: {} }, {}, { fetch: async (_r, e) => {
    calls++; return e.IMAGES ? new Response('failed', { status: 500 }) : new Response('original');
  } });
  assert.equal(await response.text(), 'original'); assert.equal(calls, 2);
});
test('successful, invalid, missing, forbidden and rate-limited images are not retried', async () => {
  for (const status of [200, 304, 400, 403, 404, 429]) {
    let calls = 0; const original = new Response(null, { status });
    assert.equal(await fetchWithImageFallback(request(), { IMAGES: {} }, {}, { fetch: async () => { calls++; return original; } }), original);
    assert.equal(calls, 1);
  }
});
test('non-image failures and requests without an image binding keep their original behavior', async () => {
  for (const [req, env] of [[new Request('https://dianaflagstaff.com/shop'), { IMAGES: {} }], [request(), {}], [new Request(url, { method: 'POST' }), { IMAGES: {} }]]) {
    let calls = 0;
    await assert.rejects(fetchWithImageFallback(req, env, {}, { fetch: async () => { calls++; throw new Error('unrelated'); } }), /unrelated/);
    assert.equal(calls, 1);
  }
});
test('fallback failure propagates once rather than recursively retrying', async () => {
  let calls = 0;
  await assert.rejects(fetchWithImageFallback(request(), { IMAGES: {} }, {}, { fetch: async () => { calls++; throw new Error('asset unavailable'); } }), /asset unavailable/);
  assert.equal(calls, 2);
});
test('image protection still rejects hotlinks before fallback is invoked', async () => {
  const denied = await imageProtection(new Request(url, { headers: { referer: 'https://foreign.example/' } }), {});
  assert.equal(denied.status, 403);
});
