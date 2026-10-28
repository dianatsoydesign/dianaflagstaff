import { validSnapshot } from './bernat-inventory.mjs';
export { FLAGSTAFF_STORE_ID, pickupQuantities, validSnapshot } from './bernat-inventory.mjs';
// Michaels labels 1 or 2 pickup skeins "Limited Quantity". Hide those colors for hats.
export const MIN_SKEINS = 3;

/** @param {{storeId:string,checkedAt:number,quantities:Record<string,number|null>} | null} snapshot @param {string} sku @param {number} [now] */
export function availableForCharismaHat(snapshot, sku, now = Date.now()) {
  return validSnapshot(snapshot, now) && (snapshot.quantities[sku] ?? 0) >= MIN_SKEINS;
}

/** @param {{storeId:string,checkedAt:number,quantities:Record<string,number|null>} | null} snapshot @param {string} sku @param {number} minimum @param {number} [now] */
export function availableForCharisma(snapshot, sku, minimum, now = Date.now()) {
  return validSnapshot(snapshot, now) && (snapshot.quantities[sku] ?? 0) >= minimum;
}
