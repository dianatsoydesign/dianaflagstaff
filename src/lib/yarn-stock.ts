/**
 * Yarn availability for the shop UI.
 *
 * Live suppliers:
 *   - Bobbiny Premium 5mm (coasters, hotpads, wine holders), Shopify catalog:
 *     https://bobbinycords.us/collections/premium-5mm
 *   - Charisma by Loops & Threads (hats), Michaels:
 *     https://www.michaels.com/product/charisma-yarn-by-loops-threads-10133751
 *
 * Other products still use catalog / stub data until a supplier is wired in.
 */

import { products, type StockStatus, type YarnColor } from "@/data/products";
import { getAllYarns, getYarnById } from "@/data/yarns";
import {
  getBobbinyAvailabilityByHandle,
  parseBobbinyHandle,
} from "@/lib/bobbiny-stock";
import { getCharismaStockBySku, parseMichaelsSku } from "@/lib/michaels-stock";

export type YarnStockResult = {
  yarnId: string;
  supplierSku?: string;
  status: StockStatus;
  source: "catalog" | "supplier_stub" | "supplier_live";
  checkedAt: string;
  message?: string;
};

/** Demo overrides for non-Bobbiny stub SKUs */
const stubOverrides: Record<string, StockStatus> = {
  "LL-YH-04": "out_of_stock",
  "LL-YH-03": "low_stock",
};

type LiveSupplier = {
  name: string;
  parse: (supplierSku: string) => string | null;
  /** Supplier key (handle / SKU) → available */
  load: () => Promise<Map<string, boolean>>;
};

const LIVE_SUPPLIERS: LiveSupplier[] = [
  { name: "Bobbiny", parse: parseBobbinyHandle, load: getBobbinyAvailabilityByHandle },
  { name: "Michaels", parse: parseMichaelsSku, load: getCharismaStockBySku },
];

function liveSupplierFor(supplierSku: string | undefined) {
  if (!supplierSku) return null;
  for (const supplier of LIVE_SUPPLIERS) {
    const key = supplier.parse(supplierSku);
    if (key) return { supplier, key };
  }
  return null;
}

export function usesLiveSupplier(yarns: YarnColor[]): boolean {
  return yarns.some((y) => liveSupplierFor(y.supplierSku) !== null);
}

function findYarnBySku(sku: string): YarnColor | undefined {
  return getAllYarns().find((y) => y.supplierSku === sku);
}

export async function checkSupplierStock(
  supplierSku: string
): Promise<YarnStockResult> {
  const yarn = findYarnBySku(supplierSku);
  const checkedAt = new Date().toISOString();

  const live = liveSupplierFor(supplierSku);
  if (live) {
    try {
      const availability = await live.supplier.load();
      const available = availability.get(live.key) ?? false;
      return {
        yarnId: yarn?.id ?? supplierSku,
        supplierSku,
        status: available ? "in_stock" : "out_of_stock",
        source: "supplier_live",
        checkedAt,
      };
    } catch {
      return {
        yarnId: yarn?.id ?? supplierSku,
        supplierSku,
        status: yarn?.stockStatus ?? "in_stock",
        source: "catalog",
        checkedAt,
        message: `Could not reach ${live.supplier.name}. Showing last known availability`,
      };
    }
  }

  await new Promise((r) => setTimeout(r, 40));

  const status =
    stubOverrides[supplierSku] ?? yarn?.stockStatus ?? "out_of_stock";

  return {
    yarnId: yarn?.id ?? supplierSku,
    supplierSku,
    status,
    source: "supplier_stub",
    checkedAt,
  };
}

export async function getYarnStock(yarnId: string): Promise<YarnStockResult> {
  const yarn = getYarnById(yarnId);
  if (!yarn) {
    return {
      yarnId,
      status: "out_of_stock",
      source: "catalog",
      checkedAt: new Date().toISOString(),
      message: "Unknown yarn color",
    };
  }

  if (yarn.supplierSku) {
    return checkSupplierStock(yarn.supplierSku);
  }

  return {
    yarnId: yarn.id,
    status: yarn.stockStatus,
    source: "catalog",
    checkedAt: new Date().toISOString(),
  };
}

export async function getProductYarnStock(
  productId: string
): Promise<YarnStockResult[]> {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  const supplier = product.yarns
    .map((y) => liveSupplierFor(y.supplierSku)?.supplier)
    .find(Boolean);

  if (supplier) {
    let availability: Map<string, boolean>;
    try {
      availability = await supplier.load();
    } catch {
      return product.yarns.map((yarn) => ({
        yarnId: yarn.id,
        supplierSku: yarn.supplierSku,
        status: yarn.stockStatus,
        source: "catalog" as const,
        checkedAt: new Date().toISOString(),
        message: `Could not reach ${supplier.name}. Showing last known availability`,
      }));
    }

    const checkedAt = new Date().toISOString();
    return product.yarns.map((yarn) => {
      const key = yarn.supplierSku ? supplier.parse(yarn.supplierSku) : null;
      if (!key) {
        return {
          yarnId: yarn.id,
          supplierSku: yarn.supplierSku,
          status: yarn.stockStatus,
          source: "catalog" as const,
          checkedAt,
        };
      }
      const available = availability.get(key) ?? false;
      return {
        yarnId: yarn.id,
        supplierSku: yarn.supplierSku,
        status: (available ? "in_stock" : "out_of_stock") as StockStatus,
        source: "supplier_live" as const,
        checkedAt,
      };
    });
  }

  return Promise.all(product.yarns.map((y) => getYarnStock(y.id)));
}

export function isSelectable(status: StockStatus): boolean {
  return status === "in_stock" || status === "low_stock";
}

export function stockLabel(status: StockStatus): string {
  switch (status) {
    case "in_stock":
      return "In stock";
    case "low_stock":
      return "Low stock";
    case "out_of_stock":
      return "Out of stock";
  }
}
