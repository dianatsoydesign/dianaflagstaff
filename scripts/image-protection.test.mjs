import { test } from 'node:test';
import assert from 'node:assert/strict';
import { imageProtection, isProtectedImage } from '../src/lib/image-protection.mjs';
const host = 'https://dianaflagstaff.com';
const image = `${host}/art/charcoal-figure-drawings/1.webp`;
const request = (url = image, headers = {}) => new Request(url, { headers });
test('gallery, yarn, products and transformed images are protected; sharing previews are public', () => {
  for (const path of ['/art/test.webp','/products/Blanket/a.JPG','/products/a%2Ejpg','/yarn-images/a.avif','/yarn-swatches/a.png', '/_next/image?url=%2Fproducts%2Fa.jpg&w=100&q=75']) assert(isProtectedImage(new URL(host+path)),path);
  for (const path of ['/social/blanket-v3.jpg','/art','/shop/p/hotpads','/_next/static/a.js','/_next/image?url=%2Fsocial%2Fa.jpg&w=100&q=75']) assert.equal(isProtectedImage(new URL(host+path)),false,path);
});
test('normal browsing, direct links, exact own hosts and Google Images work', async () => {
  for (const referer of [undefined,host+'/art','https://www.dianaflagstaff.com/shop','https://www.google.com/search?q=art']) assert.equal(await imageProtection(request(image,referer?{referer}:{}),{}),null);
});
test('external embeds, malformed referrers and lookalike domains are denied without caching', async () => {
  for (const referer of ['https://someone.example/post','https://dianaflagstaff.com.evil.example/','https://evil.example/dianaflagstaff.com','not a url']) {
    const result=await imageProtection(request(image,{referer}),{}); assert.equal(result.status,403); assert.match(result.headers.get('cache-control'),/no-store/);
  }
});
test('social previews stay usable from other sites', async () => {
  assert.equal(await imageProtection(request(host+'/social/blanket-v3.jpg',{referer:'https://facebook.com/','user-agent':'facebookexternalhit/1.1'}),{}),null);
});
test('training crawlers blocked; policy, search and user-driven crawlers remain accessible', async () => {
  for(const agent of ['GPTBot/1.2','Mozilla compatible; ClaudeBot/1.0','CCBot/2.0']) {
    assert.equal((await imageProtection(request(host+'/art',{'user-agent':agent}),{})).status,403);
    assert.equal(await imageProtection(request(host+'/robots.txt',{'user-agent':agent}),{}),null);
  }
  for(const agent of ['Googlebot-Image/1.0','bingbot','OAI-SearchBot/1.4','Claude-SearchBot/1.0','Claude-User/1.0','ChatGPT-User']) assert.equal(await imageProtection(request(image,{'user-agent':agent}),{}),null);
});
test('rate-limit image requests by trusted IP and give retry guidance; do not throttle pages', async () => {
  const keys=[]; const env={IMAGE_RATE_LIMITER:{limit:async({key})=>{keys.push(key);return{success:false}}}};
  const result=await imageProtection(request(image,{'CF-Connecting-IP':'192.0.2.1'}),env);
  assert.equal(result.status,429); assert.equal(result.headers.get('retry-after'),'60'); assert.deepEqual(keys,['images:192.0.2.1']);
  assert.equal(await imageProtection(request(host+'/shop',{'CF-Connecting-IP':'192.0.2.1'}),env),null);
  assert.equal(await imageProtection(request(image,{'X-Forwarded-For':'fake'}),env),null);
});
test('allowed requests and limiter outages preserve images',async()=>{
  const req=request(image,{'CF-Connecting-IP':'192.0.2.1'});
  assert.equal(await imageProtection(req,{IMAGE_RATE_LIMITER:{limit:async()=>({success:true})}}),null);
  assert.equal(await imageProtection(req,{IMAGE_RATE_LIMITER:{limit:async()=>{throw Error('offline')}}}),null);
});
