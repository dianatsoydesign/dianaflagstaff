import type { YarnColor } from "@/data/products";
import catalog from "@/data/bobbiny-premium-5mm.json";
import { sortByColorGroup } from "@/data/bobbiny-color-order";

/** In-stock colors from Bobbiny Premium 5mm braided cord (Shopify catalog snapshot). */
export const BOBBINY_PREMIUM_5MM_YARNS: YarnColor[] = sortByColorGroup(
  catalog.yarns as YarnColor[]
);

export const BOBBINY_PREMIUM_5MM_COLLECTION_URL =
  "https://bobbinycords.us/collections/premium-5mm";

export const BOBBINY_PREMIUM_5MM_SYNCED_AT = catalog.syncedAt;

export function getBobbinyYarnById(id: string): YarnColor | undefined {
  return BOBBINY_PREMIUM_5MM_YARNS.find((y) => y.id === id);
}

export function getBobbinyYarnBySupplierSku(
  supplierSku: string
): YarnColor | undefined {
  return BOBBINY_PREMIUM_5MM_YARNS.find((y) => y.supplierSku === supplierSku);
}
