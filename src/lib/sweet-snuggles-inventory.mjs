import { validSnapshot } from "./bernat-inventory.mjs";
export { validSnapshot, FLAGSTAFF_STORE_ID, pickupQuantities } from "./bernat-inventory.mjs";

/** Any verified pickup stock qualifies, independently of blanket size. */
export function availableForSweetSnuggles(snapshot, sku, now = Date.now()) {
  return validSnapshot(snapshot, now) && (snapshot.quantities[sku] ?? 0) > 0;
}
