import type { YarnColor } from "@/data/products";

/** White Sweet Snuggles, the yarn in Diana's blanket photographs. */
export const BLANKET_YARNS: YarnColor[] = [{
  id: "sweet-snuggles-white",
  name: "White",
  swatchSrc: "/yarn-images/sweet-snuggles/white-swatch.webp",
  colorImages: [1, 2, 3].map(index => `/yarn-images/sweet-snuggles/white-${index}.webp`),
  supplierSku: "michaels-sweet-snuggles:10610036",
  stockStatus: "out_of_stock",
}];
