export const BOBBINY_COLLECTION = 'https://bobbinycords.us/collections/premium-5mm';

/** @param {unknown} value @param {number} [now] */
export function validBobbinySnapshot(value, now = Date.now()) {
  if (!value || typeof value !== 'object') return false;
  const snapshot = /** @type {{checkedAt?:unknown,quantities?:unknown}} */ (value);
  if (typeof snapshot.checkedAt !== 'number' || !Number.isFinite(snapshot.checkedAt) || snapshot.checkedAt > now ||
      !snapshot.quantities || typeof snapshot.quantities !== 'object' || Array.isArray(snapshot.quantities)) return false;
  const entries = Object.entries(snapshot.quantities);
  return entries.length > 0 && entries.length <= 500 && entries.every(([handle, qty]) =>
    /^[a-z0-9-]+$/.test(handle) && (qty === null || (typeof qty === 'number' && Number.isSafeInteger(qty) && qty >= 0)));
}

/** @param {{checkedAt:number,quantities:Record<string,number|null>} | null} snapshot @param {string} handle */
export function availableBobbiny(snapshot, handle) {
  return validBobbinySnapshot(snapshot) && (snapshot.quantities[handle] ?? 0) >= 1;
}

/** Parse the supplier's actual quantity, not Shopify's potentially backorderable purchase flag. @param {string} html */
export function parseBobbinyCount(html) {
  const block = html.match(/<bobbinycords-inventory\b[^>]*>([\s\S]*?)<\/bobbinycords-inventory>/i)?.[1];
  if (!block) throw new Error('Bobbiny inventory count element is missing');
  const text = block.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  const match = text.match(/\b([\d,]+)\s+in stock\b/i) ?? text.match(/\bLow stock:\s*([\d,]+)\s+left\b/i);
  if (match) {
    const quantity = Number(match[1].replace(/,/g, ''));
    if (Number.isSafeInteger(quantity) && quantity >= 0) return quantity;
  }
  if (/\b(out of stock|sold out)\b/i.test(text)) return 0;
  throw new Error(`Bobbiny inventory count is unrecognized: ${text.trim().slice(0, 160)}`);
}

/** One shared supplier refresh for every Bobbiny product. @param {string[]} handles */
export async function fetchBobbinySnapshot(handles) {
  async function request(url, json = false) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DianasArt stock check)' },
          redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(25000),
        });
        if (!response.ok) throw new Error(`Bobbiny HTTP ${response.status}`);
        return json ? await response.json() : await response.text();
      } catch (error) {
        if (attempt === 2) throw error;
        await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
      }
    }
  }
  const checkedAt = Date.now();
  const feed = await request(`${BOBBINY_COLLECTION}/products.json?limit=250`, true);
  if (!Array.isArray(feed?.products) || !feed.products.length) throw new Error('Empty Bobbiny catalog response');
  if (feed.products.length >= 250) throw new Error('Bobbiny feed needs pagination before refreshing');
  /** @type {Record<string,number|null>} */
  const quantities = {};
  let cursor = 0;
  async function worker() {
    while (cursor < handles.length) {
      const handle = handles[cursor++];
      if (!/^[a-z0-9-]+$/.test(handle)) throw new Error('Invalid Bobbiny handle');
      const matches = feed.products.filter(product => product.handle === handle);
      if (matches.length > 1) throw new Error('Duplicate Bobbiny product');
      const product = matches[0];
      if (!product) { quantities[handle] = null; continue; }
      if (product.variants?.length !== 1 || typeof product.variants[0].available !== 'boolean') throw new Error('Unexpected Bobbiny variants');
      if (!product.variants[0].available) { quantities[handle] = 0; continue; }
      const html = await request(`https://bobbinycords.us/products/${encodeURIComponent(handle)}`);
      try { quantities[handle] = parseBobbinyCount(html); }
      catch (error) { throw new Error(`${handle}: ${error.message}`); }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  return { checkedAt, quantities };
}
