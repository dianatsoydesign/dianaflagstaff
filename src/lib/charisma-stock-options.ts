import catalog from '@/data/charisma.json';
import type { StockStatus } from '@/data/products';
import { CHARISMA_HOLIDAY_PIZZA_YARN_ID, CHARISMA_HOLIDAY_YARN_IDS } from '@/data/charisma-holiday-colors';
import { CHARISMA_SOFT_PALETTE_YARN_ID, CHARISMA_SOFT_PALETTE_YARN_IDS } from '@/data/charisma-soft-palette';
import { CHARISMA_WARM_PALETTE_YARN_ID, CHARISMA_WARM_PALETTE_YARN_IDS } from '@/data/charisma-warm-palette';
import { availableForCharisma } from '@/lib/charisma-inventory.mjs';

export const CHARISMA_PALETTES: Record<string, readonly string[]> = {
  "stockings-multi": CHARISMA_HOLIDAY_YARN_IDS,
  [CHARISMA_HOLIDAY_PIZZA_YARN_ID]: CHARISMA_HOLIDAY_YARN_IDS,
  [CHARISMA_SOFT_PALETTE_YARN_ID]: CHARISMA_SOFT_PALETTE_YARN_IDS,
  [CHARISMA_WARM_PALETTE_YARN_ID]: CHARISMA_WARM_PALETTE_YARN_IDS,
};

export function charismaRecipe(yarnId: string): readonly string[] {
  return CHARISMA_PALETTES[yarnId] ?? (catalog.yarns.some(yarn => yarn.id === yarnId) ? [yarnId] : []);
}

export function charismaStockStatuses(snapshot: {storeId:string;checkedAt:number;quantities:Record<string,number|null>} | null, minimum: 2 | 3): Record<string, StockStatus> {
  const statuses: Record<string, StockStatus> = {};
  for (const yarn of catalog.yarns) {
    statuses[yarn.id] = availableForCharisma(snapshot, yarn.supplierSku.split(':')[1], minimum) ? 'in_stock' : 'out_of_stock';
  }
  for (const [id, colors] of Object.entries(CHARISMA_PALETTES)) {
    statuses[id] = colors.every(color => statuses[color] === 'in_stock') ? 'in_stock' : 'out_of_stock';
  }
  return statuses;
}
