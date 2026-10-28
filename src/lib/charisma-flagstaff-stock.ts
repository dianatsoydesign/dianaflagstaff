import { charismaStockStatuses, CHARISMA_PALETTES } from '@/lib/charisma-stock-options';
import { MICHAELS_HAT_CATALOG } from '@/data/michaels-hat-catalog.mjs';
import bootstrapStock from '@/data/charisma-stock-bootstrap.json';
import { validSnapshot, FLAGSTAFF_STORE_ID, pickupQuantities } from '@/lib/charisma-inventory.mjs';

type Snapshot = { storeId: string; checkedAt: number; quantities: Record<string, number | null> };
const KEY = 'michaels:charisma:flagstaff:9608';
let localSnapshot: Snapshot | null = null;
let localRefresh: Promise<Snapshot | null> | null = null;
let localRetryAfter = 0;

// Local previews have their own KV storage; GitHub only pushes to production.
// Fetch real pickup counts here in development, with a shared hourly cache.
async function refreshLocalStock(previous: Snapshot | null): Promise<Snapshot | null> {
  const checkedAt = Date.now();
  const quantities: Record<string, number | null> = {};
  const skus = MICHAELS_HAT_CATALOG.map(yarn => yarn.supplierSku.split(':')[1]);
  try {
    for (let offset = 0; offset < skus.length; offset += 25) {
      const batch = skus.slice(offset, offset + 25);
      const query = new URLSearchParams({ skuNumbers: batch.join(','), michaelsStoreId: FLAGSTAFF_STORE_ID, fields: 'inventory', source: 'pdpPage' });
      const response = await fetch(`https://www.michaels.com/api/product/v2/sub-skus?${query}`, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error(`Michaels HTTP ${response.status}`);
      Object.assign(quantities, pickupQuantities(await response.json(), batch));
    }
    localSnapshot = { storeId: FLAGSTAFF_STORE_ID, checkedAt, quantities };
    return localSnapshot;
  } catch (error) {
    localRetryAfter = Date.now() + 60000;
    console.warn('Local Flagstaff stock refresh failed', error);
    return previous && validSnapshot(previous) ? previous : bootstrapStock;
  }
}

async function stockKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    return (await getCloudflareContext({ async: true })).env.BOBBINY_STOCK ?? null;
  } catch {
    return null;
  }
}

export async function readCharismaFlagstaffStock(): Promise<Snapshot | null> {
  let snapshot: Snapshot | null = null;
  try {
    const kv = await stockKv();
    const raw = kv ? await kv.get(KEY) : null;
    snapshot = raw ? JSON.parse(raw) : null;
  } catch {
    // Keep the latest verified snapshot during a temporary storage outage.
  }
  const candidates = [snapshot, localSnapshot, bootstrapStock].filter((value): value is Snapshot => value !== null && validSnapshot(value));
  snapshot = candidates.sort((a, b) => b.checkedAt - a.checkedAt)[0] ?? null;
  localSnapshot = snapshot;
  if (process.env.NODE_ENV === 'development') {
    if (localSnapshot && validSnapshot(localSnapshot) &&
        (!snapshot || !validSnapshot(snapshot) || localSnapshot.checkedAt > snapshot.checkedAt)) snapshot = localSnapshot;
    if (snapshot && validSnapshot(snapshot) && MICHAELS_HAT_CATALOG.every(yarn => Object.hasOwn(snapshot?.quantities ?? {}, yarn.supplierSku.split(':')[1])) && Date.now() - snapshot.checkedAt < 60 * 60 * 1000) return snapshot;
    if (Date.now() >= localRetryAfter) {
      if (!localRefresh) localRefresh = refreshLocalStock(snapshot).finally(() => { localRefresh = null; });
      return localRefresh;
    }
  }
  return snapshot && validSnapshot(snapshot) ? snapshot : null;
}

export async function saveCharismaFlagstaffStock(value: unknown) {
  if (!validSnapshot(value)) throw new Error('Invalid Flagstaff stock snapshot');
  const snapshot = value as Snapshot;
  // Ingestion must be recent; never reset an old snapshot's original check time.
  if (Date.now() - snapshot.checkedAt > 5 * 60 * 1000) throw new Error('Stock check is too old');
  const expected = MICHAELS_HAT_CATALOG.map(yarn => yarn.supplierSku.split(':')[1]);
  if (Object.keys(snapshot.quantities).length !== expected.length ||
      expected.some(sku => !Object.hasOwn(snapshot.quantities, sku))) throw new Error('Incomplete Charisma catalog');
  const kv = await stockKv();
  if (!kv && process.env.NODE_ENV !== 'development') throw new Error('Stock storage unavailable');
  const raw = kv ? await kv.get(KEY) : null;
  const previous: Snapshot | null = raw ? JSON.parse(raw) : localSnapshot;
  if (previous && validSnapshot(previous) && previous.checkedAt >= snapshot.checkedAt) throw new Error('Stock snapshot already saved or superseded');
  if (kv) await kv.put(KEY, JSON.stringify(snapshot));
  localSnapshot = snapshot;
}

export async function charismaFlagstaffAvailability(minimum: 2 | 3) {
  const snapshot = await readCharismaFlagstaffStock();
  const statuses = charismaStockStatuses(snapshot, minimum);
  const yarns = [...MICHAELS_HAT_CATALOG, ...Object.keys(CHARISMA_PALETTES).map(id => ({ id, supplierSku: undefined }))];
  return yarns.map(yarn => ({
    yarnId: yarn.id,
    supplierSku: yarn.supplierSku,
    status: statuses[yarn.id],
    source: 'supplier_live' as const,
    checkedAt: snapshot ? new Date(snapshot.checkedAt).toISOString() : '',
  }));
}
