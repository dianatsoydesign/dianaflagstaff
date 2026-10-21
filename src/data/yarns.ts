import { PATTERN_BOARD_YARNS, products, type YarnColor } from "@/data/products";
import { BOBBINY_PREMIUM_5MM_YARNS } from "@/data/bobbiny-premium-5mm";
import { charismaHolidayPizzaYarn } from "@/data/charisma-holiday-colors";
import { charismaSoftPaletteYarn } from "@/data/charisma-soft-palette";
import { charismaWarmPaletteYarn } from "@/data/charisma-warm-palette";

/** Deduplicated yarn library used by catalog + pattern-request pickers */
export function getAllYarns(): YarnColor[] {
  const map = new Map<string, YarnColor>();
  for (const yarn of BOBBINY_PREMIUM_5MM_YARNS) {
    map.set(yarn.id, yarn);
  }
  for (const product of products) {
    for (const yarn of product.yarns) {
      if (!map.has(yarn.id)) map.set(yarn.id, yarn);
    }
  }
  for (const yarn of PATTERN_BOARD_YARNS) {
    if (!map.has(yarn.id)) map.set(yarn.id, yarn);
  }
  const holidayPizza = charismaHolidayPizzaYarn();
  map.set(holidayPizza.id, holidayPizza);
  const softPalette = charismaSoftPaletteYarn();
  map.set(softPalette.id, softPalette);
  const warmPalette = charismaWarmPaletteYarn();
  map.set(warmPalette.id, warmPalette);
  return Array.from(map.values());
}

/** Supplier yarn line shown as the picker heading and in gallery alt text. */
export function yarnLineName(yarn: YarnColor): string | null {
  if (yarn.supplierSku?.startsWith("bobbiny:")) return "Bobbiny Premium 5mm";
  if (yarn.supplierSku?.startsWith("michaels:")) return "Charisma by Loops & Threads";
  return null;
}

export type YarnMaterial = {
  fiber: string;
  washCare: string;
  dryCare: string;
  detail: string;
};

const MACHINE_WASH_COLD = "machine wash cold";
const AIR_DRY = "air dry";

const CHARISMA_MATERIAL: YarnMaterial = {
  fiber: "100% acrylic",
  washCare: MACHINE_WASH_COLD,
  dryCare: AIR_DRY,
  detail: "",
};

/** Fiber content from each supplier's product page (bobbinycords.us, michaels.com). */
export function yarnMaterial(yarn: YarnColor): YarnMaterial {
  if (
    yarn.supplierSku?.startsWith("bobbiny:") ||
    yarn.id.startsWith("bobbiny-5mm-")
  ) {
    return yarn.name.startsWith("Shiny ")
      ? {
          fiber: "98% recycled cotton, 2% metallic thread",
          washCare: MACHINE_WASH_COLD,
          dryCare: AIR_DRY,
          detail: "",
        }
      : {
          fiber: "100% recycled cotton",
          washCare: MACHINE_WASH_COLD,
          dryCare: AIR_DRY,
          detail: "",
        };
  }
  if (
    yarn.supplierSku?.startsWith("michaels:") ||
    yarn.id.startsWith("charisma-")
  ) {
    return CHARISMA_MATERIAL;
  }
  // Custom colorways and legacy swatches; same care as Charisma pieces
  return CHARISMA_MATERIAL;
}

export function getYarnById(id: string): YarnColor | undefined {
  return getAllYarns().find((y) => y.id === id);
}
