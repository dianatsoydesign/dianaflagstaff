import type { YarnColor } from "@/data/products";
import charismaGroupOverrides from "@/data/charisma-group-overrides.json";

/** Rainbow from green, then browns, neutrals (grey/black/white). Multicolor yarns are omitted from the picker. */
export const CHARISMA_COLOR_GROUPS = [
  { id: "greens", label: "Greens" },
  { id: "yellows", label: "Yellows" },
  { id: "oranges", label: "Oranges" },
  { id: "reds", label: "Reds" },
  { id: "pinks", label: "Pinks" },
  { id: "purples", label: "Purples" },
  { id: "blues", label: "Blues" },
  { id: "browns", label: "Browns" },
  { id: "neutrals", label: "Neutrals" },
] as const;

export type CharismaColorGroupId = (typeof CHARISMA_COLOR_GROUPS)[number]["id"];

const GROUP_SORT_INDEX = new Map<CharismaColorGroupId, number>(
  CHARISMA_COLOR_GROUPS.map((g, i) => [g.id, i])
);

const GROUP_IDS = new Set<string>(CHARISMA_COLOR_GROUPS.map((g) => g.id));

function isCharismaGroupId(id: string): id is CharismaColorGroupId {
  return GROUP_IDS.has(id);
}

export function isCharismaMulticolorYarn(yarn: {
  id?: string;
  multicolor?: boolean;
  sortRank?: number;
}): boolean {
  if (yarn.id && !yarn.id.startsWith("charisma-")) return false;
  return Boolean(yarn.multicolor || (yarn.sortRank ?? 0) >= 2000);
}

/** Infer family from sync/resort sortRank when colorGroup is missing (legacy JSON). */
export function inferCharismaColorGroupId(yarn: {
  sortRank?: number;
  multicolor?: boolean;
}): CharismaColorGroupId | null {
  if (isCharismaMulticolorYarn(yarn)) return null;
  const { sortRank = Number.MAX_SAFE_INTEGER } = yarn;
  if (sortRank >= 1000) {
    if (sortRank >= 1035 || sortRank <= 1012) return "neutrals";
    return "browns";
  }
  if (sortRank < 171) return "greens";
  let hue = sortRank - 200;
  if (hue < 0) hue += 360;
  if (hue >= 345 || hue < 25) return "reds";
  if (hue < 70) return "yellows";
  if (hue < 170) return "greens";
  if (hue < 265) return "blues";
  if (hue < 300) return "purples";
  return "pinks";
}

export function charismaColorGroupId(
  yarn: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">
): CharismaColorGroupId | null {
  if (!yarn.id.startsWith("charisma-")) return null;
  if (isCharismaMulticolorYarn(yarn)) return null;
  const forced = charismaGroupOverrides[
    yarn.id as keyof typeof charismaGroupOverrides
  ];
  if (forced && isCharismaGroupId(forced)) return forced;
  if (
    yarn.colorGroup === "greys" ||
    yarn.colorGroup === "blacks" ||
    yarn.colorGroup === "whites"
  ) {
    return "neutrals";
  }
  if (yarn.colorGroup && isCharismaGroupId(yarn.colorGroup)) {
    return yarn.colorGroup;
  }
  return inferCharismaColorGroupId(yarn);
}

/** Index for rainbow catalog sort (lower = earlier in the picker). */
export function charismaColorGroupSortIndex(
  yarn: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">
): number {
  if (isCharismaMulticolorYarn(yarn)) return CHARISMA_COLOR_GROUPS.length;
  const id = charismaColorGroupId(yarn);
  if (!id) return CHARISMA_COLOR_GROUPS.length;
  return GROUP_SORT_INDEX.get(id) ?? CHARISMA_COLOR_GROUPS.length;
}

/** Same order as `CHARISMA_YARNS` in charisma.ts (group, then sortRank). */
export function compareCharismaYarnCatalogOrder(
  a: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">,
  b: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">
): number {
  const ga = charismaColorGroupSortIndex(a);
  const gb = charismaColorGroupSortIndex(b);
  if (ga !== gb) return ga - gb;
  return (
    (a.sortRank ?? Number.MAX_SAFE_INTEGER) -
    (b.sortRank ?? Number.MAX_SAFE_INTEGER)
  );
}

export function isCharismaColorCatalog(yarns: { id: string }[]): boolean {
  const charisma = yarns.filter((y) => y.id.startsWith("charisma-"));
  return charisma.length > 20;
}

export function filterCharismaYarnsByGroup<T extends YarnColor>(
  yarns: T[],
  groupId: CharismaColorGroupId | null
): T[] {
  if (!groupId) return yarns;
  return [...yarns]
    .filter((y) => charismaColorGroupId(y) === groupId)
    .sort(compareCharismaYarnCatalogOrder);
}

export function charismaGroupsForYarns(
  yarns: YarnColor[]
): { id: CharismaColorGroupId; label: string }[] {
  const present = new Set<CharismaColorGroupId>();
  for (const y of yarns) {
    const g = charismaColorGroupId(y);
    if (g) present.add(g);
  }
  return CHARISMA_COLOR_GROUPS.filter((g) => present.has(g.id)).map((g) => ({
    id: g.id,
    label: g.label,
  }));
}
