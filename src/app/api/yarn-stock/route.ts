import { NextResponse } from "next/server";
import { getProductYarnStock, getYarnStock } from "@/lib/yarn-stock";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  const yarnId = searchParams.get("yarnId");

  if (productId) {
    const results = await getProductYarnStock(productId);
    return NextResponse.json({ results }, { headers: { "Cache-Control": "no-store" } });
  }

  if (yarnId) {
    const result = await getYarnStock(yarnId);
    return NextResponse.json({ result }, { headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json(
    { error: "Provide productId or yarnId" },
    { status: 400 }
  );
}
