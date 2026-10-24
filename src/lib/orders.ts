import { randomUUID } from "crypto";
import type { AggregatedLine, Order } from "@/lib/order-types";

export type { AggregatedLine, Order, OrderLine, OrderLineKind } from "@/lib/order-types";
export { formatAggregateLine } from "@/lib/order-types";

const ORDERS_KV_KEY = "orders:v1";

/** In-memory fallback when neither KV nor local filesystem is available */
let memoryOrders: Order[] | null = null;

type StoreKind = "kv" | "fs" | "memory";

async function getOrdersKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env.ORDERS_KV ?? null;
  } catch {
    return null;
  }
}

async function canUseFs(): Promise<boolean> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "data", "orders");
    await fs.mkdir(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

async function resolveStore(): Promise<StoreKind> {
  if (await getOrdersKv()) return "kv";
  if (await canUseFs()) return "fs";
  return "memory";
}

async function ensureFsStore(): Promise<{ file: string }> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const dir = path.join(process.cwd(), "data", "orders");
  const file = path.join(dir, "orders.json");
  await fs.mkdir(dir, { recursive: true });
  try {
    await fs.access(file);
  } catch {
    await fs.writeFile(file, "[]\n", "utf8");
  }
  return { file };
}

function parseOrders(raw: string | null | undefined): Order[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function readOrders(): Promise<Order[]> {
  const store = await resolveStore();

  if (store === "kv") {
    const kv = await getOrdersKv();
    const raw = await kv!.get(ORDERS_KV_KEY);
    return parseOrders(raw);
  }

  if (store === "fs") {
    const fs = await import("fs/promises");
    const { file } = await ensureFsStore();
    const raw = await fs.readFile(file, "utf8");
    return parseOrders(raw);
  }

  if (memoryOrders === null) memoryOrders = [];
  return memoryOrders;
}

async function writeOrders(orders: Order[]): Promise<void> {
  const store = await resolveStore();
  const payload = JSON.stringify(orders, null, 2) + "\n";

  if (store === "kv") {
    const kv = await getOrdersKv();
    await kv!.put(ORDERS_KV_KEY, payload);
    return;
  }

  if (store === "fs") {
    const fs = await import("fs/promises");
    const { file } = await ensureFsStore();
    await fs.writeFile(file, payload, "utf8");
    return;
  }

  memoryOrders = orders;
}

export async function createOrder(
  input: Omit<Order, "id" | "createdAt" | "status" | "total"> & {
    status?: Order["status"];
  }
): Promise<Order> {
  const orders = await readOrders();
  const total = input.lines.some((line) => line.priceTbd)
    ? input.lines
        .filter((line) => !line.priceTbd)
        .reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
    : input.lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0
      );
  const order: Order = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    customerNote: input.customerNote,
    venmoHandle: input.venmoHandle,
    pickupPreference: input.pickupPreference,
    lines: input.lines,
    total,
    status: input.status ?? "new",
  };
  orders.unshift(order);
  await writeOrders(orders);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order | null> {
  const orders = await readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  orders[idx] = { ...orders[idx], status };
  await writeOrders(orders);
  return orders[idx];
}

/** Aggregate open orders into “3 Adult M hats in Forest Heather” style rows */
export function aggregateFulfillment(orders: Order[]): AggregatedLine[] {
  const map = new Map<string, AggregatedLine>();
  for (const order of orders) {
    if (order.status === "done") continue;
    for (const line of order.lines) {
      const key = `${line.kind}::${line.productId}::${line.sizeId}::${line.yarnId}::${line.tagId ?? ""}::${line.pomPomId ?? ""}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += line.quantity;
      } else {
        map.set(key, {
          key,
          kind: line.kind,
          productId: line.productId,
          productName: line.productName,
          sizeLabel: line.sizeLabel,
          yarnName: line.yarnName,
          tagLabel: line.tagLabel,
          pomPomLabel: line.pomPomLabel,
          quantity: line.quantity,
          patternName: line.patternName,
          designerName: line.designerName,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName)
  );
}
