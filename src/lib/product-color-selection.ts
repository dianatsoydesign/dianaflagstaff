import type { Product, StockStatus, YarnColor } from "@/data/products";

/** Start unselected unless the shopper follows an explicit color link. */
export function initialProductYarn(
  product: Product,
  stock: Record<string, StockStatus>,
  requestedId?: string | null,
  requireVerifiedStock = false,
): YarnColor | null {
  const id = requestedId ?? null;
  const yarn = product.yarns.find((candidate) => candidate.id === id);
  if (!yarn) return null;
  const status = stock[yarn.id] ??
    (requireVerifiedStock && yarn.supplierSku ? "out_of_stock" : yarn.stockStatus);
  return status === "in_stock" || status === "low_stock" ? yarn : null;
}
