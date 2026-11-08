import type { Product, StockStatus, YarnColor } from "@/data/products";

/** Fixed-color products select their sole yarn; other products start unselected. */
export function initialProductYarn(
  product: Product,
  stock: Record<string, StockStatus>,
  requestedId?: string | null,
  requireVerifiedStock = false,
): YarnColor | null {
  const id = product.hideColorPicker && product.yarns.length === 1
    ? product.yarns[0].id
    : requestedId ?? null;
  const yarn = product.yarns.find((candidate) => candidate.id === id);
  if (!yarn) return null;
  const status = stock[yarn.id] ??
    (requireVerifiedStock && yarn.supplierSku ? "out_of_stock" : yarn.stockStatus);
  return status === "in_stock" || status === "low_stock" ? yarn : null;
}
