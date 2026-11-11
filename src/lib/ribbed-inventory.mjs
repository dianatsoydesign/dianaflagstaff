import { availableForCharisma } from './charisma-inventory.mjs';
export const RIBBED_MIN_STOCK = 2;
export const RIBBED_SKEINS_PER_ITEM = 1;
export function isRibbedProduct(id) {
  return id === 'ribbed-hat' || id === 'ribbed-headband';
}
export function availableForRibbed(snapshot, sku, now = Date.now()) {
  return availableForCharisma(snapshot, sku, RIBBED_MIN_STOCK, now);
}
export function ribbedStockStatuses(snapshot, yarns) {
  return Object.fromEntries(yarns.map(yarn => [yarn.id,
    yarn.supplierSku?.startsWith('michaels:')
      ? (availableForRibbed(snapshot, yarn.supplierSku.split(':')[1]) ? 'in_stock' : 'out_of_stock')
      : yarn.stockStatus,
  ]));
}
