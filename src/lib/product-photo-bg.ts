/** Studio matte, sampled from AI + studio product photos (warm light greige). */
export const PRODUCT_PHOTO_BG = "#e2d8d2";

export const productPhotoBgClass = "bg-[#e2d8d2]";

export function isBobbinyYarnId(yarnId: string): boolean {
  return yarnId.startsWith("bobbiny-5mm-");
}

export function isBobbinySupplierPhoto(src: string): boolean {
  return src.includes("cdn.shopify.com");
}
