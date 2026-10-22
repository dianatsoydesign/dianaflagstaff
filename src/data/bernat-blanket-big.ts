import type { YarnColor } from "@/data/products";
import catalog from "@/data/bernat-blanket-big.json";
import { CHARISMA_COLOR_GROUPS } from "@/data/charisma-color-groups";

/** Michaels catalog colors. Local store availability is not filtered yet. */
export const BERNAT_BLANKET_BIG_YARNS = catalog.yarns as YarnColor[];
export const BERNAT_COLOR_GROUPS = [
  ...CHARISMA_COLOR_GROUPS,
  { id: "multis", label: "Multicolors" },
] as const;
export type BernatColorGroupId = (typeof BERNAT_COLOR_GROUPS)[number]["id"];
export function bernatColorGroupId(yarn: YarnColor): BernatColorGroupId | null {
  if (yarn.multicolor) return "multis";
  return BERNAT_COLOR_GROUPS.find((g) => g.id === yarn.colorGroup)?.id ?? null;
}
export function bernatGroupsForYarns(yarns: YarnColor[]) {
  const present = new Set(yarns.map(bernatColorGroupId));
  return BERNAT_COLOR_GROUPS.filter((g) => present.has(g.id));
}
