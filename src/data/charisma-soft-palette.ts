import type { YarnColor } from "@/data/products";

/** Selectable five-color palette (no supplier color photos). */
export const CHARISMA_SOFT_PALETTE_YARN_ID = "charisma-soft-palette";

export const CHARISMA_SOFT_PALETTE_YARN_IDS = [
  "charisma-cloud",
  "charisma-sage",
  "charisma-pine",
  "charisma-taupe",
  "charisma-caramel",
] as const;

/** Sampled from picker swatches; order matches {@link CHARISMA_SOFT_PALETTE_YARN_IDS}. */
export const CHARISMA_SOFT_PALETTE_SLICE_COLORS = [
  "#d8d7dc",
  "#7c8e6d",
  "#37403a",
  "#aa8b75",
  "#a96f4e",
] as const;

export function isCharismaSoftPaletteYarn(
  yarnId: string | null | undefined
): boolean {
  return yarnId === CHARISMA_SOFT_PALETTE_YARN_ID;
}

export function charismaSoftPaletteYarn(): YarnColor {
  return {
    id: CHARISMA_SOFT_PALETTE_YARN_ID,
    name: "Holiday soft palette",
    swatchSrc: "/yarn-swatches/charisma-soft-palette.svg",
    stockStatus: "in_stock",
  };
}

export function charismaHasSoftPaletteYarns(yarns: { id: string }[]): boolean {
  const ids = new Set(yarns.map((y) => y.id));
  return CHARISMA_SOFT_PALETTE_YARN_IDS.every((id) => ids.has(id));
}
