import lightness from "@/data/yarn-lightness.json";

/** One perceptual-lightness scale for every supplier, lightest first within each reviewed family.
 * Refresh cached measurements with node scripts/sort-yarn-lightness.mjs --write.
 */
export function compareYarnLightness(a: { id: string }, b: { id: string }): number {
  const values: Record<string, number> = lightness;
  if (values[a.id] === undefined || values[b.id] === undefined) return 0;
  return values[b.id] - values[a.id];
}
