import { listedProducts, type Product } from "@/data/products";

/** Explicit associations, independent of shop categories. A product may join multiple groups.
 * Ask Diana before assigning any uncertain association or adding a speculative group.
 * Unassigned products get no recommendations; never fill with unrelated products.
 */
export const recommendationGroups: Record<string, readonly string[]> = {
  hats: ["hats", "elf-hat", "mushroom-hat"],
  holiday: ["christmas-stockings", "elf-hat", "mushroom-hat"],
  pets: ["cat-cave"],
  kitchen: ["coasters", "hotpads", "placemats"],
};

export function getRelatedProducts(productId: string, limit = 2): Product[] {
  const relatedIds = new Set(
    Object.values(recommendationGroups)
      .filter((members) => members.includes(productId))
      .flat()
  );
  return listedProducts
    .filter((product) => product.id !== productId && relatedIds.has(product.id))
    .slice(0, Math.max(0, limit));
}

/** Diana-approved temporary exception: retire automatically once a pet peer is listed. */
export function getRandomRecommendationPool(productId: string): Product[] {
  if (productId !== "cat-cave" || getRelatedProducts(productId).length > 0) return [];
  return listedProducts.filter((product) => product.id !== productId);
}
