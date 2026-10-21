/**
 * Bobbiny Premium 5mm live stock.
 *
 * Strategy:
 *   1. Check KV ("bobbiny:stock"), shared across all Worker instances.
 *   2. If KV entry is missing or older than CACHE_MAX_AGE_MS, fetch fresh.
 *   3. Write the result back to KV with a TTL so Cloudflare auto-expires it.
 *   4. Fall back to in-memory cache when KV is unavailable (local dev / tests).
 */

const BOBBINY_PRODUCTS_JSON =
  "https://bobbinycords.us/collections/premium-5mm/products.json?limit=250";

const KV_KEY = "bobbiny:stock";
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour
const KV_TTL_SECONDS = 2 * 60 * 60; // keep in KV for 2 h as a safety buffer

// ── In-memory fallback (local dev / Worker cold-start before KV is populated) ──
type MemCache = {
  fetchedAt: number;
  availabilityByHandle: Map<string, boolean>;
};
let memCache: MemCache | null = null;

// ── KV helpers (same pattern as orders.ts) ────────────────────────────────────
async function getBobbinyKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env.BOBBINY_STOCK ?? null;
  } catch {
    return null;
  }
}

// ── Core fetch from Bobbiny ────────────────────────────────────────────────────
async function fetchFromBobbiny(): Promise<Map<string, boolean>> {
  // Workers send no User-Agent by default, and Shopify answers 403 without one.
  const res = await fetch(BOBBINY_PRODUCTS_JSON, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DianasArt stock check)" },
  });
  if (!res.ok) throw new Error(`Bobbiny fetch failed (${res.status})`);
  const data = (await res.json()) as {
    products: { handle: string; variants: { available: boolean }[] }[];
  };
  const map = new Map<string, boolean>();
  for (const p of data.products) {
    map.set(p.handle, p.variants.some((v) => v.available));
  }
  return map;
}

// ── Serialisation helpers ─────────────────────────────────────────────────────
function serialise(map: Map<string, boolean>): string {
  return JSON.stringify({ fetchedAt: Date.now(), data: Object.fromEntries(map) });
}

function deserialise(raw: string): MemCache | null {
  try {
    const parsed = JSON.parse(raw) as { fetchedAt: number; data: Record<string, boolean> };
    return {
      fetchedAt: parsed.fetchedAt,
      availabilityByHandle: new Map(Object.entries(parsed.data)),
    };
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function getBobbinyAvailabilityByHandle(): Promise<Map<string, boolean>> {
  const kv = await getBobbinyKv();

  // 1. Try KV
  if (kv) {
    const raw = await kv.get(KV_KEY);
    if (raw) {
      const cached = deserialise(raw);
      if (cached && Date.now() - cached.fetchedAt < CACHE_MAX_AGE_MS) {
        return cached.availabilityByHandle;
      }
    }
  }

  // 2. KV stale or unavailable: fall back to in-memory
  if (memCache && Date.now() - memCache.fetchedAt < CACHE_MAX_AGE_MS) {
    return memCache.availabilityByHandle;
  }

  // 3. Fetch fresh
  let map: Map<string, boolean>;
  try {
    map = await fetchFromBobbiny();
  } catch {
    // Return whatever we have (stale is better than nothing)
    if (kv) {
      const raw = await kv.get(KV_KEY);
      if (raw) {
        const cached = deserialise(raw);
        if (cached) return cached.availabilityByHandle;
      }
    }
    if (memCache) return memCache.availabilityByHandle;
    return new Map();
  }

  // 4. Persist
  const serialised = serialise(map);
  if (kv) {
    await kv.put(KV_KEY, serialised, { expirationTtl: KV_TTL_SECONDS });
  }
  memCache = { fetchedAt: Date.now(), availabilityByHandle: map };

  return map;
}

/** Force a refresh regardless of cache age. Used by the cron endpoint. */
export async function forceRefreshBobbinyStock(): Promise<{ count: number }> {
  const kv = await getBobbinyKv();
  const map = await fetchFromBobbiny();
  const serialised = serialise(map);
  if (kv) {
    await kv.put(KV_KEY, serialised, { expirationTtl: KV_TTL_SECONDS });
  }
  memCache = { fetchedAt: Date.now(), availabilityByHandle: map };
  return { count: map.size };
}

export function parseBobbinyHandle(supplierSku: string): string | null {
  if (!supplierSku.startsWith("bobbiny:")) return null;
  return supplierSku.slice("bobbiny:".length);
}
