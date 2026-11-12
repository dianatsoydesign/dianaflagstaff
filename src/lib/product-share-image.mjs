import { createHash } from "node:crypto";

/** Derive the share asset from the same cover path used for gallery slide one. */
export function productShareImagePath(product) {
  const version = createHash("sha256").update(product.imageSrc).digest("hex").slice(0, 12);
  return `/social/${product.id}-cover-${version}.jpg`;
}
