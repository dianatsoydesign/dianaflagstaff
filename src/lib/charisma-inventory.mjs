import hatCatalog from '../data/hat-yarns.json' with { type: 'json' };
import { validSnapshot } from './bernat-inventory.mjs';
export { FLAGSTAFF_STORE_ID, pickupQuantities, validSnapshot } from './bernat-inventory.mjs';
// Default hat minimum. Individual yarn lines may define a reviewed override.
export const MIN_SKEINS = 3;
export function minimumForHatSku(sku) {
  const yarn = hatCatalog.yarns.find(yarn => yarn.supplierSku === `michaels:${sku}`);
  return hatCatalog.lines.find(line => line.id === yarn?.lineId)?.minimumSkeins ?? MIN_SKEINS;
}

/** @param {{storeId:string,checkedAt:number,quantities:Record<string,number|null>} | null} snapshot @param {string} sku @param {number} [now] */
export function availableForCharismaHat(snapshot, sku, now = Date.now()) {
  return validSnapshot(snapshot, now) && (snapshot.quantities[sku] ?? 0) >= minimumForHatSku(sku);
}

/** @param {{storeId:string,checkedAt:number,quantities:Record<string,number|null>} | null} snapshot @param {string} sku @param {number} minimum @param {number} [now] */
export function availableForCharisma(snapshot, sku, minimum, now = Date.now()) {
  return validSnapshot(snapshot, now) && (snapshot.quantities[sku] ?? 0) >= minimum;
}

/** Bulk holiday colors keep their recipe; all other stocking colors require four local skeins. */
export function minimumForStockingColor(yarnId) {
  return ["charisma-pine", "charisma-red", "charisma-white", "charisma-off-white"].includes(yarnId) ? 3 : 4;
}
