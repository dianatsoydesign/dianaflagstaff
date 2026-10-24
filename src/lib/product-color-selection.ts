import type { Product, StockStatus, YarnColor } from "@/data/products";

/** Never substitute an unrelated color for the pictured or explicitly requested one. */
export function initialProductYarn(
  product: Product,
  stock: Record<string, StockStatus>,
  requestedId?: string | null,
  requireVerifiedStock = false,
): YarnColor | null {
  const id = requestedId ?? product.defaultYarnId ??
    (product.yarns.length === 1 ? product.yarns[0].id : null);
  const yarn = product.yarns.find((candidate) => candidate.id === id);
  if (!yarn) return null;
  const status = stock[yarn.id] ??
    (requireVerifiedStock && yarn.supplierSku ? "out_of_stock" : yarn.stockStatus);
  return status === "in_stock" || status === "low_stock" ? yarn : null;
}
