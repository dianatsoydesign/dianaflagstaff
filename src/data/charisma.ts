import type { YarnColor } from "@/data/products";
import catalog from "@/data/charisma.json";
import { MICHAELS_HAT_CATALOG } from "@/data/michaels-hat-catalog.mjs";
import { compareCharismaYarnCatalogOrder } from "@/data/charisma-color-groups";

function sortCharismaYarns(yarns: YarnColor[]): YarnColor[] {
  return [...yarns].sort(compareCharismaYarnCatalogOrder);
}

/** Every Charisma® Yarn by Loops & Threads® color at Michaels (catalog snapshot). */
export const CHARISMA_YARNS: YarnColor[] = sortCharismaYarns(
  catalog.yarns as YarnColor[]
);

export const CHARISMA_PRODUCT_URL = catalog.productUrl;

export const CHARISMA_MASTER_SKU = catalog.masterSku;

export const CHARISMA_SYNCED_AT = catalog.syncedAt;

/** All reviewed Charisma lines; excludes other brands in the shared hat catalog. */
export const STOCKING_CHARISMA_YARNS: YarnColor[] = sortCharismaYarns(
  MICHAELS_HAT_CATALOG.filter(yarn => yarn.id.startsWith("charisma-")) as YarnColor[]
);
