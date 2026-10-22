import catalog from '@/data/bobbiny-premium-5mm.json';
import bootstrapStock from '@/data/bobbiny-stock-bootstrap.json';
import { availableBobbiny, fetchBobbinySnapshot, validBobbinySnapshot } from '@/lib/bobbiny-inventory.mjs';

type Snapshot = { checkedAt: number; quantities: Record<string, number | null> };
const KEY = 'bobbiny:premium-5mm:quantities';
const handles = catalog.yarns.map(yarn => yarn.supplierSku.slice('bobbiny:'.length));
let memory: Snapshot | null = null;
let pending: Promise<Snapshot | null> | null = null;
let retryAfter = 0;

async function stockKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare');
    return (await getCloudflareContext({ async: true })).env.BOBBINY_STOCK ?? null;
  } catch { return null; }
}

export async function readBobbinyStock(): Promise<Snapshot | null> {
  let saved: Snapshot | null = null;
  try {
    const raw = await (await stockKv())?.get(KEY);
    saved = raw ? JSON.parse(raw) : null;
  } catch { /* Preserve the last verified choices during storage outages. */ }
  const candidates = [saved, memory, bootstrapStock].filter((snapshot): snapshot is Snapshot => snapshot !== null && validBobbinySnapshot(snapshot));
  memory = candidates.sort((a, b) => b.checkedAt - a.checkedAt)[0] ?? null;
  if (process.env.NODE_ENV === 'development' && Date.now() - (memory?.checkedAt ?? 0) >= 3600000 && Date.now() >= retryAfter) {
    if (!pending) {
      pending = fetchBobbinySnapshot(handles).then(snapshot => { memory = snapshot; return snapshot; }).catch(error => {
        console.warn('Local Bobbiny stock refresh failed', error);
        retryAfter = Date.now() + 60000;
        return memory;
      }).finally(() => { pending = null; });
    }
    return pending;
  }
  return memory;
}

export async function saveBobbinyStock(value: unknown) {
  if (!validBobbinySnapshot(value)) throw new Error('Invalid Bobbiny stock snapshot');
  const snapshot = value as Snapshot;
  if (Date.now() - snapshot.checkedAt > 300000) throw new Error('Stock check is too old');
  if (Object.keys(snapshot.quantities).length !== handles.length || handles.some(handle => !Object.hasOwn(snapshot.quantities, handle))) throw new Error('Incomplete Bobbiny catalog');
  const kv = await stockKv();
  if (!kv && process.env.NODE_ENV !== 'development') throw new Error('Stock storage unavailable');
  const raw = kv ? await kv.get(KEY) : null;
  const previous: Snapshot | null = raw ? JSON.parse(raw) : memory;
  if (previous && validBobbinySnapshot(previous) && previous.checkedAt >= snapshot.checkedAt) throw new Error('Stock snapshot already saved or superseded');
  if (kv) await kv.put(KEY, JSON.stringify(snapshot));
  memory = snapshot;
}

export async function getBobbinyAvailabilityByHandle(): Promise<Map<string, boolean>> {
  const snapshot = await readBobbinyStock();
  return new Map(handles.map(handle => [handle, availableBobbiny(snapshot, handle)]));
}

export async function bobbinyAvailability() {
  const snapshot = await readBobbinyStock();
  return catalog.yarns.map(yarn => ({
    yarnId: yarn.id, supplierSku: yarn.supplierSku,
    status: availableBobbiny(snapshot, yarn.supplierSku.slice('bobbiny:'.length)) ? 'in_stock' as const : 'out_of_stock' as const,
    source: 'supplier_live' as const,
    checkedAt: snapshot ? new Date(snapshot.checkedAt).toISOString() : '',
  }));
}

/** Legacy manual refresh endpoint: production updates now run in GitHub. */
export async function forceRefreshBobbinyStock(): Promise<{ count: number }> {
  if (process.env.NODE_ENV !== 'development') throw new Error('Bobbiny stock is updated by the GitHub workflow');
  const snapshot = await fetchBobbinySnapshot(handles);
  await saveBobbinyStock(snapshot);
  return { count: handles.length };
}

export function parseBobbinyHandle(supplierSku: string): string | null {
  return supplierSku.startsWith('bobbiny:') ? supplierSku.slice('bobbiny:'.length) : null;
}
