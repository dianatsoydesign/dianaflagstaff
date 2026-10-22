export type PickupTiming = {
  productionDays: number;
  /** Bobbiny ships in business days; Michaels pickup takes calendar days. */
  sourcing: "bobbiny" | "michaels";
};

/** Date-only calculations use UTC; caller supplies today's America/Phoenix date. */
export function pickupRange(today: string, timing: PickupTiming) {
  function readyDate(latest: boolean) {
    const date = new Date(`${today}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + (latest ? 1 : 0));
    if (timing.sourcing === "bobbiny") {
      let weekdays = 0;
      while (weekdays < 6) {
        date.setUTCDate(date.getUTCDate() + 1);
        if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) weekdays++;
      }
    } else {
      date.setUTCDate(date.getUTCDate() + (latest ? 2 : 1));
    }
    date.setUTCDate(date.getUTCDate() + timing.productionDays);
    return date;
  }
  return { start: readyDate(false), end: readyDate(true) };
}

export function productionDaysForProduct(options: {
  productId: string;
  quantity: number;
  pomPomId: string;
  multicolor: boolean | null;
  customSize: boolean;
}): number | null {
  const { productId, quantity, pomPomId, multicolor, customSize } = options;
  if (customSize) return null;
  switch (productId) {
    case "coasters": return Math.ceil(quantity / 4);
    case "hotpads": return Math.ceil(quantity / 2);
    case "placemats": return quantity;
    case "hats": return ({ "no-pom-pom": 1, "with-pom-pom": 2, "snap-on-pom-pom": 3 } as Record<string, number>)[pomPomId] ?? null;
    case "elf-hat":
    case "mushroom-hat": return 5;
    case "christmas-stockings": return multicolor === null ? null : multicolor ? 5 : 3;
    case "cat-cave": return 3;
    default: return null;
  }
}

export const productsWithPickupEstimates = new Set([
  "coasters", "hotpads", "placemats", "hats", "elf-hat", "mushroom-hat", "christmas-stockings", "cat-cave",
]);
