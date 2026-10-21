import { NextResponse } from "next/server";
import { forceRefreshCharismaStock } from "@/lib/michaels-stock";

/**
 * POST /api/cron/refresh-charisma
 *
 * Re-checks Charisma (hat yarn) stock at Michaels and writes it to KV.
 * Works in local dev only: Michaels blocks Cloudflare, so the live site gets
 * stock pushed to /api/cron/charisma-stock instead.
 * Protected by CRON_SECRET when it is set. GET is allowed for manual
 * testing in the browser when no secret is configured.
 */
async function refresh(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { count, inStock } = await forceRefreshCharismaStock();
    return NextResponse.json({
      ok: true,
      refreshed: new Date().toISOString(),
      colorCount: count,
      inStockCount: inStock,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        note: "Shop keeps showing the last known Charisma stock",
      },
      { status: 502 }
    );
  }
}

export const POST = refresh;
export const GET = refresh;

export const dynamic = "force-dynamic";
