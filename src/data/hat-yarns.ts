import type { YarnColor } from "@/data/products";
import { MICHAELS_HAT_CATALOG } from "@/data/michaels-hat-catalog.mjs";
import { compareCharismaYarnCatalogOrder } from "@/data/charisma-color-groups";

export const HAT_YARNS: YarnColor[] = [...MICHAELS_HAT_CATALOG as YarnColor[]].sort(compareCharismaYarnCatalogOrder);
