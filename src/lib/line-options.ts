import { getProduct } from "@/data/products";
import { colorName } from "@/lib/color-name";
import type { OrderLineKind } from "@/lib/order-types";

export function productShowsSize(
  productId: string,
  kind: OrderLineKind | "catalog" | "pattern_request"
): boolean {
  if (kind === "pattern_request") return true;
  const product = getProduct(productId);
  if (!product) return true;
  return !product.hideSizePicker;
}

/** Yarn color and size for cart, checkout, and maker views. */
export function formatLineOptions(line: {
  productId: string;
  kind: OrderLineKind | "catalog" | "pattern_request";
  yarnName: string;
  sizeLabel: string;
  tagLabel?: string;
  pomPomLabel?: string;
}): string {
  const color = colorName(line.yarnName);
  const parts: string[] = [];
  if (productShowsSize(line.productId, line.kind)) {
    parts.push(`${color} · Size: ${line.sizeLabel}`);
  } else {
    parts.push(color);
  }
  if (line.pomPomLabel) parts.push(`Pom pom: ${line.pomPomLabel}`);
  if (line.tagLabel) parts.push(`Tag: ${line.tagLabel}`);
  return parts.join(" · ");
}
