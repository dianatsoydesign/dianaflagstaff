/**
 * Michaels live stock for Charisma yarn (hats).
 *
 * Uses the JSON endpoints Michaels' own site calls. Product pages are
 * bot-blocked, these are not:
 *   1. /api/product/v2/skus?skuNumbers=<master>    → color → SKU map
 *   2. /api/product/v2/sub-skus?skuNumbers=<skus>  → per-SKU online stock
 *
 * Michaels blocks requests from Cloudflare's network, so on the live site
 * the stock is pushed in hourly from Diana's Mac
 * (scripts/push-charisma-stock.mjs → /api/cron/charisma-stock) and read
 * from KV here. Direct fetching still works in local dev.
 */

import { CHARISMA_MASTER_SKU } from "@/data/charisma";

const MICHAELS_API = "https://www.michaels.com/api/product/v2";
const HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};

// Shares the BOBBINY_STOCK namespace; keys are prefixed per supplier.
const KV_KEY = "michaels:charisma:stock";
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
// Keeps the last pushed stock through a weekend of the Mac being asleep.
const KV_TTL_SECONDS = 72 * 60 * 60;

type Cache = { fetchedAt: number; inStockBySku: Map<string, boolean> };
let memCache: Cache | null = null;

async function getStockKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env.BOBBINY_STOCK ?? null;
  } catch {
    return null;
  }
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Michaels fetch failed (${res.status}) ${url}`);
  return (await res.json()) as T;
}

async function fetchFromMichaels(): Promise<Map<string, boolean>> {
  const [master] = await getJson<{ variantSkus?: Record<string, string> }[]>(
    `${MICHAELS_API}/skus?skuNumbers=${CHARISMA_MASTER_SKU}`
  );
  const skus = Object.values(master?.variantSkus ?? {});
  if (!skus.length) throw new Error("Michaels returned no Charisma colors");

  const subs = await getJson<
    { skuNumber: string; inventoryMcu?: { inStock?: boolean } }[]
  >(`${MICHAELS_API}/sub-skus?skuNumbers=${skus.join(",")}`);

  const map = new Map<string, boolean>();
  for (const sub of subs) {
    map.set(sub.skuNumber, Boolean(sub.inventoryMcu?.inStock));
  }
  return map;
}

function serialise(map: Map<string, boolean>): string {
  return JSON.stringify({ fetchedAt: Date.now(), data: Object.fromEntries(map) });
}

function deserialise(raw: string): Cache | null {
  try {
    const parsed = JSON.parse(raw) as { fetchedAt: number; data: Record<string, boolean> };
    return { fetchedAt: parsed.fetchedAt, inStockBySku: new Map(Object.entries(parsed.data)) };
  } catch {
    return null;
  }
}

async function readKv(kv: KVNamespace | null): Promise<Cache | null> {
  if (!kv) return null;
  const raw = await kv.get(KV_KEY);
  return raw ? deserialise(raw) : null;
}

async function persist(kv: KVNamespace | null, map: Map<string, boolean>) {
  if (kv) await kv.put(KV_KEY, serialise(map), { expirationTtl: KV_TTL_SECONDS });
  memCache = { fetchedAt: Date.now(), inStockBySku: map };
}

/**
 * SKU → in stock online. Throws only when Michaels is unreachable and there
 * is no earlier result to fall back on.
 */
export async function getCharismaStockBySku(): Promise<Map<string, boolean>> {
  const kv = await getStockKv();

  const cached = (await readKv(kv)) ?? memCache;
  if (cached && Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
    return cached.inStockBySku;
  }

  try {
    const map = await fetchFromMichaels();
    await persist(kv, map);
    return map;
  } catch (err) {
    if (cached) return cached.inStockBySku;
    throw err;
  }
}

/** Store stock fetched elsewhere (Diana's Mac). */
export async function saveCharismaStock(inStockBySku: Map<string, boolean>) {
  await persist(await getStockKv(), inStockBySku);
}

/** Force a refresh regardless of cache age. */
export async function forceRefreshCharismaStock(): Promise<{
  count: number;
  inStock: number;
}> {
  const kv = await getStockKv();
  const map = await fetchFromMichaels();
  await persist(kv, map);
  return {
    count: map.size,
    inStock: [...map.values()].filter(Boolean).length,
  };
}

export function parseMichaelsSku(supplierSku: string): string | null {
  if (!supplierSku.startsWith("michaels:")) return null;
  return supplierSku.slice("michaels:".length);
}
