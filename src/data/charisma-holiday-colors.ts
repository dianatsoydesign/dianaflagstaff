import type { YarnColor } from "@/data/products";
import {
  type CharismaColorGroupId,
  filterCharismaYarnsByGroup,
  isCharismaMulticolorYarn,
} from "@/data/charisma-color-groups";
import { CHARISMA_SOFT_PALETTE_YARN_ID } from "@/data/charisma-soft-palette";
import { CHARISMA_WARM_PALETTE_YARN_ID } from "@/data/charisma-warm-palette";

/** Selectable tri-color holiday palette (no supplier color photos). */
export const CHARISMA_HOLIDAY_PIZZA_YARN_ID = "charisma-holiday-pizza";

/** Curated holiday palette (also listed under their color-family chips). */
export const CHARISMA_HOLIDAY_YARN_IDS = [
  "charisma-off-white",
  "charisma-pine",
  "charisma-red",
] as const;

/** Sampled from picker swatches; order matches {@link CHARISMA_HOLIDAY_YARN_IDS}. */
export const CHARISMA_HOLIDAY_PIZZA_SLICE_COLORS = [
  "#eae2cf",
  "#37403a",
  "#6f0519",
] as const;

export type CharismaPickerGroupId = CharismaColorGroupId | "holiday";

export function isCharismaHolidayPizzaYarn(
  yarnId: string | null | undefined
): boolean {
  return yarnId === CHARISMA_HOLIDAY_PIZZA_YARN_ID;
}

export function charismaHolidayPizzaYarn(): YarnColor {
  return {
    id: CHARISMA_HOLIDAY_PIZZA_YARN_ID,
    name: "Classic",
    swatchSrc: "/yarn-swatches/charisma-holiday-pizza.svg",
    stockStatus: "in_stock",
  };
}

export function charismaHasHolidayYarns(yarns: { id: string }[]): boolean {
  const ids = new Set(yarns.map((y) => y.id));
  return CHARISMA_HOLIDAY_YARN_IDS.some((id) => ids.has(id));
}

export function charismaHolidayYarnsInCatalog<T extends { id: string }>(
  yarns: T[]
): T[] {
  const byId = new Map(yarns.map((y) => [y.id, y]));
  const picked: T[] = [];
  for (const id of CHARISMA_HOLIDAY_YARN_IDS) {
    const yarn = byId.get(id);
    if (yarn) picked.push(yarn);
  }
  return picked;
}

function isHolidayPickerVirtualYarn(id: string): boolean {
  return (
    id === CHARISMA_HOLIDAY_PIZZA_YARN_ID ||
    id === CHARISMA_SOFT_PALETTE_YARN_ID ||
    id === CHARISMA_WARM_PALETTE_YARN_ID
  );
}

function withoutCuratedPaletteYarns<T extends { id: string }>(yarns: T[]): T[] {
  return yarns.filter((y) => !isHolidayPickerVirtualYarn(y.id));
}

function withoutMulticolorCharismaYarns<T extends YarnColor>(yarns: T[]): T[] {
  return yarns.filter((y) => !isCharismaMulticolorYarn(y));
}

export function filterCharismaYarnsForPicker<T extends YarnColor>(
  yarns: T[],
  groupId: CharismaPickerGroupId | null
): T[] {
  const catalog = withoutMulticolorCharismaYarns(
    withoutCuratedPaletteYarns(yarns)
  );
  if (!groupId) return catalog;
  if (groupId === "holiday") return charismaHolidayYarnsInCatalog(catalog);
  return filterCharismaYarnsByGroup(catalog, groupId);
}
