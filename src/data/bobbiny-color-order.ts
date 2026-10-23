/** Display order: rainbow from green, then beiges/browns, then grayscale (grey → black → white). */
export const BOBBINY_COLOR_GROUPS = [
  {
    id: "greens",
    label: "Greens",
    keys: [
      "pale-olive",
      "avocado",
      "moss-green",
      "eucalyptus-green",
      "aloe",
      "shiny-jade-green",
      "jade-green",
      "pine-green",
      "jelly-mint",
      "laurel",
    ],
  },
  {
    id: "yellows-oranges-reds",
    label: "Yellows, oranges & reds",
    keys: [
      "mustard",
      "spicy-yellow",
      "canary-yellow",
      "terracotta",
      "classic-red",
      "red-velvet",
      "wine-red",
    ],
  },
  {
    id: "pinks",
    label: "Pinks & purples",
    keys: [
      "blossom",
      "bubblegum-pink",
      "dusty-rose",
      "blush",
      "pastel-pink",
      "mauve",
      "pearl",
      "aubergine",
    ],
  },
  {
    id: "blues",
    label: "Blues",
    keys: ["duck-egg-blue", "teal", "peacock-blue", "misty", "jeans", "ink-blue"],
  },
  {
    id: "beiges",
    label: "Beiges & naturals",
    keys: [
      "golden-natural",
      "natural",
      "cashmere-beige",
      "shiny-cashmere-beige",
      "warm-beige",
      "leopard",
      "beige",
      "nude",
      "sand",
    ],
  },
  { id: "browns", label: "Browns", keys: ["caramel", "nut-brown", "coffee", "shiny-chocolate-brown"] },
  {
    id: "grayscale",
    label: "Grayscale",
    keys: [
      "light-grey",
      "steel",
      "charcoal",
      "midnight-dust",
      "black",
      "off-white",
      "white",
    ],
  },
] as const;

export type BobbinyColorGroupId = (typeof BOBBINY_COLOR_GROUPS)[number]["id"];

const COLOR_GROUPS = BOBBINY_COLOR_GROUPS.map((g) => g.keys);

const ORDER = COLOR_GROUPS.flat();
const NEUTRALS_START = ORDER.indexOf("golden-natural");

const KEY_TO_GROUP = new Map<string, BobbinyColorGroupId>();
for (const group of BOBBINY_COLOR_GROUPS) {
  for (const key of group.keys) {
    KEY_TO_GROUP.set(key, group.id);
  }
}

function colorKey(id: string): string {
  return id.replace(/^bobbiny-5mm-/, "").replace(/^100m-/, "");
}

function rank(id: string): number {
  const i = (ORDER as readonly string[]).indexOf(colorKey(id));
  // Colors added by a future catalog sync land at the end of the rainbow, before neutrals.
  return i === -1 ? NEUTRALS_START - 0.5 : i;
}

export function sortByColorGroup<T extends { id: string }>(yarns: T[]): T[] {
  return [...yarns].sort((a, b) => rank(a.id) - rank(b.id));
}

export function bobbinyColorGroupId(yarnId: string): BobbinyColorGroupId | null {
  return KEY_TO_GROUP.get(colorKey(yarnId)) ?? null;
}

export function isBobbinyColorCatalog(yarns: { id: string }[]): boolean {
  return yarns.length > 0 && yarns.every((y) => y.id.startsWith("bobbiny-5mm-"));
}

/** Filter Bobbiny yarns to one family; `null` keeps the full sorted list. */
export function filterBobbinyYarnsByGroup<T extends { id: string }>(
  yarns: T[],
  groupId: BobbinyColorGroupId | null
): T[] {
  if (!groupId) return yarns;
  return yarns.filter((y) => bobbinyColorGroupId(y.id) === groupId);
}

/** Groups that have at least one yarn in the current in-stock list. */
export function bobbinyGroupsForYarns(
  yarns: { id: string }[]
): { id: BobbinyColorGroupId; label: string }[] {
  const present = new Set<BobbinyColorGroupId>();
  for (const y of yarns) {
    const g = bobbinyColorGroupId(y.id);
    if (g) present.add(g);
  }
  return BOBBINY_COLOR_GROUPS.filter((g) => present.has(g.id)).map((g) => ({
    id: g.id,
    label: g.label,
  }));
}
