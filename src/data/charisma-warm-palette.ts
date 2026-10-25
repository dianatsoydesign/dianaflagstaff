import type { YarnColor } from "@/data/products";

/** Soft palette plus red (no supplier color photos). */
export const CHARISMA_WARM_PALETTE_YARN_ID = "charisma-warm-palette";

export const CHARISMA_WARM_PALETTE_YARN_IDS = [
  "charisma-cloud",
  "charisma-sage",
  "charisma-pine",
  "charisma-taupe",
  "charisma-caramel",
  "charisma-red",
] as const;

/** Sampled from picker swatches; order matches {@link CHARISMA_WARM_PALETTE_YARN_IDS}. */
export const CHARISMA_WARM_PALETTE_SLICE_COLORS = [
  "#d8d7dc",
  "#7c8e6d",
  "#37403a",
  "#aa8b75",
  "#a96f4e",
  "#6f0519",
] as const;

export function isCharismaWarmPaletteYarn(
  yarnId: string | null | undefined
): boolean {
  return yarnId === CHARISMA_WARM_PALETTE_YARN_ID;
}

export function charismaWarmPaletteYarn(): YarnColor {
  return {
    id: CHARISMA_WARM_PALETTE_YARN_ID,
    name: "Holiday warm palette",
    swatchSrc: "/yarn-swatches/charisma-warm-palette.svg",
    stockStatus: "in_stock",
  };
}

export function charismaHasWarmPaletteYarns(yarns: { id: string }[]): boolean {
  const ids = new Set(yarns.map((y) => y.id));
  return CHARISMA_WARM_PALETTE_YARN_IDS.every((id) => ids.has(id));
}
