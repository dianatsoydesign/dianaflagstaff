import { formatPriceOrTbd, type SizeOption } from "@/data/products";

/** Shared price wording for size summaries and options. */
export function sizeOptionPrice(size: SizeOption, basePrice?: number, suffix = ""): string {
  if (!size.priceTbd && size.price === undefined && basePrice === undefined) return "";
  return `${formatPriceOrTbd(!!size.priceTbd, size.price ?? basePrice!)}${size.priceTbd ? "" : suffix}`;
}

export function sizeOptionLabel(size: SizeOption, basePrice?: number, suffix = ""): string {
  const price = sizeOptionPrice(size, basePrice, suffix);
  return `${size.label}${price ? ` · ${price}` : ""}`;
}
