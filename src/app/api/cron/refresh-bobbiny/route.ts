import { NextResponse } from "next/server";
import { forceRefreshBobbinyStock } from "@/lib/bobbiny-stock";

/**
 * POST /api/cron/refresh-bobbiny
 *
 * Forces a fresh fetch of Bobbiny stock and writes it to KV.
 * Called hourly by the Worker's scheduled handler (custom-worker.ts).
 * Protected by CRON_SECRET so it can't be triggered by strangers.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { count } = await forceRefreshBobbinyStock();
  return NextResponse.json({
    ok: true,
    refreshed: new Date().toISOString(),
    colorCount: count,
  });
}

// Also allow GET for easy manual testing in the browser (no secret check needed
// when there's no secret configured, local dev only).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Use POST with Authorization header" }, { status: 401 });
    }
  }
  const { count } = await forceRefreshBobbinyStock();
  return NextResponse.json({
    ok: true,
    refreshed: new Date().toISOString(),
    colorCount: count,
  });
}

export const dynamic = "force-dynamic";
