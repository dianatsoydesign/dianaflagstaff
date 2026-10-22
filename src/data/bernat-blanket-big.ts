import type { YarnColor } from "@/data/products";
import catalog from "@/data/bernat-blanket-big.json";

export const BERNAT_COLOR_GROUPS = [
  { id: "greens", label: "Greens" },
  { id: "yellows", label: "Yellows" },
  { id: "reds-pinks", label: "Reds + pinks" },
  { id: "purples", label: "Purples" },
  { id: "blues", label: "Blues" },
  { id: "browns", label: "Browns" },
  { id: "neutrals", label: "Neutrals" },
  { id: "multis", label: "Multicolors" },
] as const;
export type BernatColorGroupId = (typeof BERNAT_COLOR_GROUPS)[number]["id"];

/** Display families can combine reviewed colors without changing supplier data. */
export function bernatColorGroupId(yarn: YarnColor): BernatColorGroupId | null {
  if (yarn.multicolor) return "multis";
  if (["reds", "pinks", "oranges"].includes(yarn.colorGroup ?? "")) return "reds-pinks";
  return BERNAT_COLOR_GROUPS.find((g) => g.id === yarn.colorGroup)?.id ?? null;
}

function compareBernatYarns(a: YarnColor, b: YarnColor) {
  const family = (yarn: YarnColor) => BERNAT_COLOR_GROUPS.findIndex((g) => g.id === bernatColorGroupId(yarn));
  return family(a) - family(b)
    || ((a.sortRank ?? 0) % 1000) - ((b.sortRank ?? 0) % 1000)
    || a.name.localeCompare(b.name);
}

/** Michaels catalog colors; local store availability is not filtered yet. */
export const BERNAT_BLANKET_BIG_YARNS: YarnColor[] = [...catalog.yarns as YarnColor[]].sort(compareBernatYarns);

export function bernatGroupsForYarns(yarns: YarnColor[]) {
  const present = new Set(yarns.map(bernatColorGroupId));
  return BERNAT_COLOR_GROUPS.filter((g) => present.has(g.id));
}
