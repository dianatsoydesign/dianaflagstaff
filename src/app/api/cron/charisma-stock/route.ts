import { NextResponse } from "next/server";
import { saveCharismaStock } from "@/lib/michaels-stock";

/**
 * POST /api/cron/charisma-stock
 *
 * Receives Charisma stock checked from Diana's Mac, because Michaels blocks
 * requests from Cloudflare. Sent hourly by scripts/push-charisma-stock.mjs.
 *
 * Body: { "inStockBySku": { "10133759": true, ... } }
 * Requires Authorization: Bearer <CRON_SECRET>. Without a secret configured,
 * only local development accepts pushes.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Set CRON_SECRET on the Worker before pushing stock" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const raw = (body as { inStockBySku?: unknown })?.inStockBySku;
  const entries =
    raw && typeof raw === "object" ? Object.entries(raw as Record<string, unknown>) : [];
  const valid =
    entries.length > 0 &&
    entries.length <= 500 &&
    entries.every(([sku, inStock]) => /^\d+$/.test(sku) && typeof inStock === "boolean");
  if (!valid) {
    return NextResponse.json(
      { error: "Expected { inStockBySku: { <numeric SKU>: boolean } }" },
      { status: 400 }
    );
  }

  const map = new Map(entries as [string, boolean][]);
  await saveCharismaStock(map);
  return NextResponse.json({
    ok: true,
    saved: new Date().toISOString(),
    colorCount: map.size,
    inStockCount: [...map.values()].filter(Boolean).length,
  });
}

export const dynamic = "force-dynamic";
