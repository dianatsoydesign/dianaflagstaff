import type { YarnColor } from "@/data/products";
import charismaGroupOverrides from "@/data/charisma-group-overrides.json";

/** Rainbow from green, then browns, neutrals (grey/black/white). Multicolor yarns follow the solid families. */
export const CHARISMA_COLOR_GROUPS = [
  { id: "greens", label: "Greens" },
  { id: "yellows-oranges-reds", label: "Yellows, oranges & reds" },
  { id: "pinks-purples", label: "Pinks & purples" },
  { id: "blues", label: "Blues" },
  { id: "browns", label: "Browns" },
  { id: "neutrals", label: "Neutrals" },
  { id: "multis", label: "Multicolor" },
] as const;

export type CharismaColorGroupId = (typeof CHARISMA_COLOR_GROUPS)[number]["id"];

const GROUP_SORT_INDEX = new Map<CharismaColorGroupId, number>(
  CHARISMA_COLOR_GROUPS.map((g, i) => [g.id, i])
);

const GROUP_IDS = new Set<string>(CHARISMA_COLOR_GROUPS.map((g) => g.id));

/** Merge display families while preserving reviewed supplier classifications. */
function displayCharismaGroupId(id: string): CharismaColorGroupId | null {
  if (["yellows", "oranges", "reds"].includes(id)) return "yellows-oranges-reds";
  if (["pinks", "purples"].includes(id)) return "pinks-purples";
  return GROUP_IDS.has(id) ? id as CharismaColorGroupId : null;
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
  if (isCharismaMulticolorYarn(yarn)) return "multis";
  const { sortRank = Number.MAX_SAFE_INTEGER } = yarn;
  if (sortRank >= 1000) {
    if (sortRank >= 1035 || sortRank <= 1012) return "neutrals";
    return "browns";
  }
  if (sortRank < 171) return "greens";
  let hue = sortRank - 200;
  if (hue < 0) hue += 360;
  if (hue >= 345 || hue < 25) return "yellows-oranges-reds";
  if (hue < 70) return "yellows-oranges-reds";
  if (hue < 170) return "greens";
  if (hue < 265) return "blues";
  if (hue < 300) return "pinks-purples";
  return "pinks-purples";
}

export function charismaColorGroupId(
  yarn: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">
): CharismaColorGroupId | null {
  if (!yarn.id.startsWith("charisma-")) return null;
  if (isCharismaMulticolorYarn(yarn)) return "multis";
  const forced = charismaGroupOverrides[
    yarn.id as keyof typeof charismaGroupOverrides
  ];
  const forcedGroup = forced ? displayCharismaGroupId(forced) : null;
  if (forcedGroup) return forcedGroup;
  if (
    yarn.colorGroup === "greys" ||
    yarn.colorGroup === "blacks" ||
    yarn.colorGroup === "whites"
  ) {
    return "neutrals";
  }
  const group = yarn.colorGroup ? displayCharismaGroupId(yarn.colorGroup) : null;
  if (group) return group;
  return inferCharismaColorGroupId(yarn);
}

/** Index for rainbow catalog sort (lower = earlier in the picker). */
export function charismaColorGroupSortIndex(
  yarn: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">
): number {
  const id = charismaColorGroupId(yarn);
  if (!id) return CHARISMA_COLOR_GROUPS.length;
  return GROUP_SORT_INDEX.get(id) ?? CHARISMA_COLOR_GROUPS.length;
}

/** Keep the requested family sequence within each combined chip. */
function charismaSubgroupSortIndex(
  yarn: Pick<YarnColor, "id" | "colorGroup">
): number {
  const family = charismaGroupOverrides[
    yarn.id as keyof typeof charismaGroupOverrides
  ] ?? yarn.colorGroup;
  switch (family) {
    case "yellows":
    case "pinks":
      return 0;
    case "oranges":
    case "purples":
      return 1;
    case "reds":
      return 2;
    default:
      return 3;
  }
}

/** Catalog order: display group, original family, then existing shade order. */
export function compareCharismaYarnCatalogOrder(
  a: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">,
  b: Pick<YarnColor, "id" | "colorGroup" | "sortRank" | "multicolor">
): number {
  const ga = charismaColorGroupSortIndex(a);
  const gb = charismaColorGroupSortIndex(b);
  if (ga !== gb) return ga - gb;
  const subgroup = charismaSubgroupSortIndex(a) - charismaSubgroupSortIndex(b);
  if (subgroup !== 0) return subgroup;
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
