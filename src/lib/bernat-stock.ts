import catalog from '@/data/bernat-blanket-big.json';
import { availableForCatCave, freshSnapshot, validSnapshot } from '@/lib/bernat-inventory.mjs';

type Snapshot = { storeId: string; checkedAt: number; quantities: Record<string, number | null> };
const KEY = 'michaels:bernat:flagstaff:9608';
let localSnapshot: Snapshot | null = null;

async function stockKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    return (await getCloudflareContext({ async: true })).env.BOBBINY_STOCK ?? null;
  } catch {
    return null;
  }
}

export async function readBernatStock(): Promise<Snapshot | null> {
  try {
    const kv = await stockKv();
    const raw = kv ? await kv.get(KEY) : null;
    const snapshot: Snapshot | null = raw ? JSON.parse(raw) : process.env.NODE_ENV === 'development' ? localSnapshot : null;
    return snapshot && freshSnapshot(snapshot) ? snapshot : null;
  } catch {
    return null;
  }
}

export async function saveBernatStock(value: unknown) {
  if (!validSnapshot(value)) throw new Error('Invalid Flagstaff stock snapshot');
  const snapshot = value as Snapshot;
  // Ingestion must be recent; never reset an old snapshot's original check time.
  if (Date.now() - snapshot.checkedAt > 5 * 60 * 1000) throw new Error('Stock check is too old');
  const expected = catalog.yarns.map(yarn => yarn.supplierSku.split(':')[1]);
  if (Object.keys(snapshot.quantities).length !== expected.length ||
      expected.some(sku => !Object.hasOwn(snapshot.quantities, sku))) throw new Error('Incomplete Bernat catalog');
  const kv = await stockKv();
  if (!kv && process.env.NODE_ENV !== 'development') throw new Error('Stock storage unavailable');
  const raw = kv ? await kv.get(KEY) : null;
  const previous: Snapshot | null = raw ? JSON.parse(raw) : localSnapshot;
  if (previous && validSnapshot(previous) && previous.checkedAt >= snapshot.checkedAt) throw new Error('Stock snapshot already saved or superseded');
  if (kv) await kv.put(KEY, JSON.stringify(snapshot), { expirationTtl: 86400 });
  else localSnapshot = snapshot;
}

export async function bernatAvailability() {
  const snapshot = await readBernatStock();
  return catalog.yarns.map(yarn => ({
    yarnId: yarn.id,
    supplierSku: yarn.supplierSku,
    status: availableForCatCave(snapshot, yarn.supplierSku.split(':')[1]) ? 'in_stock' as const : 'out_of_stock' as const,
    source: 'supplier_live' as const,
    checkedAt: snapshot ? new Date(snapshot.checkedAt).toISOString() : '',
    message: snapshot ? undefined : 'Yarn availability is being updated.',
  }));
}
