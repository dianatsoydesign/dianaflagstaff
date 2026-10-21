export const PRODUCT_TAGS = [
  { id: "handmade-by-diana", label: "Handmade by Diana" },
  { id: "handmade-in-flagstaff", label: "Handmade in Flagstaff" },
] as const;

export type ProductTagId = (typeof PRODUCT_TAGS)[number]["id"];

export const DEFAULT_PRODUCT_TAG_ID: ProductTagId = "handmade-by-diana";

export function getProductTag(id: ProductTagId) {
  return PRODUCT_TAGS.find((t) => t.id === id)!;
}

export function isProductTagId(id: string): id is ProductTagId {
  return PRODUCT_TAGS.some((t) => t.id === id);
}
