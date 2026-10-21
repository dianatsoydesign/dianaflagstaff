import type { YarnColor } from "@/data/products";
import catalog from "@/data/charisma.json";
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
