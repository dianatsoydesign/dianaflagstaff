import { stockingPlacementLabel } from "@/lib/stocking-personalization.mjs";
import { getProduct } from "@/data/products";
import { sentenceCaseColorName } from "@/lib/color-name";
import { getAllYarns, getYarnById } from "@/data/yarns";
import { yarnColorLabel } from "@/lib/yarn-color-label";
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
  yarnId?: string;
  sizeLabel: string;
  tagLabel?: string;
  pomPomLabel?: string;
  personalizationText?: string;
  personalizationPlacement?: string;
}): string {
  const yarn = line.yarnId ? getYarnById(line.yarnId) : undefined;
  const color = yarn ? yarnColorLabel(yarn, getAllYarns()) : sentenceCaseColorName(line.yarnName);
  const parts: string[] = [];
  if (productShowsSize(line.productId, line.kind)) {
    parts.push(`${color} · Size: ${line.sizeLabel}`);
  } else {
    parts.push(color);
  }
  if (line.personalizationText) parts.push(`Name: ${line.personalizationText} (${stockingPlacementLabel(line.personalizationPlacement)})`);
  if (line.pomPomLabel) parts.push(`Pom pom: ${line.pomPomLabel}`);
  if (line.tagLabel) parts.push(`Tag: ${line.tagLabel}`);
  return parts.join(" · ");
}
