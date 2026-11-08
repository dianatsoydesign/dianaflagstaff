import type { YarnColor } from "@/data/products";
import catalog from "@/data/sweet-snuggles.json";

import { compareYarnLightness } from "@/lib/yarn-color-order";

const families = ["greens", "yellows", "oranges", "reds", "pinks", "purples", "blues", "browns", "neutrals", "multis"];
export const BLANKET_YARNS = [...catalog.yarns as YarnColor[]].sort((a, b) =>
  families.indexOf(a.colorGroup ?? "") - families.indexOf(b.colorGroup ?? "") || compareYarnLightness(a, b)
);
