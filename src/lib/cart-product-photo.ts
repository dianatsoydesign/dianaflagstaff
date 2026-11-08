import type { Product } from "@/data/products";

const normalized = (value?: string) => value?.trim().toLowerCase().replace(/\s+/g, " ") ?? "";

/** Match finished product photos only; supplier yarn photos are not cart thumbnails. */
export function cartProductPhoto(
  product: Pick<Product, "imageSrc" | "imageAlt" | "imageShownColor" | "imageShownStyle" | "galleryImages">,
  color: string,
  style?: string,
): string {
  const photos = [
    { type: "image" as const, src: product.imageSrc, shownColor: product.imageShownColor, shownStyle: product.imageShownStyle },
    ...(product.galleryImages ?? []),
  ].filter(photo => photo.type !== "video");
  const colorMatch = (photo: typeof photos[number]) => normalized(photo.shownColor) === normalized(color);
  const styleMatch = (photo: typeof photos[number]) => !!style && normalized(photo.shownStyle) === normalized(style);
  // Never choose a photo explicitly labeled as another selected style.
  const compatible = photos.filter(photo => !style || !photo.shownStyle || styleMatch(photo));
  return compatible.find(photo => colorMatch(photo) && styleMatch(photo))?.src
    ?? compatible.find(colorMatch)?.src
    ?? photos.find(styleMatch)?.src
    ?? product.imageSrc;
}
