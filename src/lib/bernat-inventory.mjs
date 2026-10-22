/** Local pickup only. Shared by the website and the hourly GitHub job. */
export const FLAGSTAFF_STORE_ID = '9608';
export const MIN_SKEINS = 3;

/** @param {unknown} value @param {number} [now] */
export function validSnapshot(value, now = Date.now()) {
  if (!value || typeof value !== 'object') return false;
  const snapshot = /** @type {{storeId?:unknown, checkedAt?:unknown, quantities?:unknown}} */ (value);
  if (snapshot.storeId !== FLAGSTAFF_STORE_ID || typeof snapshot.checkedAt !== 'number' ||
      !Number.isFinite(snapshot.checkedAt) || snapshot.checkedAt > now ||
      !snapshot.quantities || typeof snapshot.quantities !== 'object' || Array.isArray(snapshot.quantities)) return false;
  const entries = Object.entries(snapshot.quantities);
  return entries.length > 0 && entries.length <= 500 && entries.every(([sku, qty]) =>
    /^\d+$/.test(sku) && (qty === null || (typeof qty === 'number' && Number.isSafeInteger(qty) && qty >= 0)));
}

/** @param {{storeId:string, checkedAt:number, quantities:Record<string,number|null>} | null} snapshot @param {string} sku @param {number} [now] */
export function availableForCatCave(snapshot, sku, now = Date.now()) {
  return validSnapshot(snapshot, now) && (snapshot.quantities[sku] ?? 0) >= MIN_SKEINS;
}

/** Validate the complete batch before saving; never use shipping inventory. @param {unknown} data @param {string[]} skus */
export function pickupQuantities(data, skus) {
  if (!Array.isArray(data)) throw new Error('Michaels returned no inventory array');
  /** @type {Record<string, number|null>} */
  const quantities = {};
  for (const sku of skus) {
    const matches = data.filter(row => row?.skuNumber === sku);
    if (matches.length !== 1) throw new Error(`Missing or duplicate SKU ${sku}`);
    const pickup = matches[0].inventoryStorePickUp;
    if (!pickup) { quantities[sku] = null; continue; }
    if (String(pickup?.michaelsStoreId) !== FLAGSTAFF_STORE_ID || pickup?.skuNumber !== sku ||
        !Number.isSafeInteger(pickup?.availableQuantity) || pickup.availableQuantity < 0) {
      throw new Error(`Unverified Flagstaff pickup quantity for ${sku}`);
    }
    quantities[sku] = pickup.availableQuantity;
  }
  return quantities;
}
