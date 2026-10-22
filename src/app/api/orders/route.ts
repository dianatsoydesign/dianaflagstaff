import { readBernatStock } from "@/lib/bernat-stock";
import { availableForCatCave, MIN_SKEINS } from "@/lib/bernat-inventory.mjs";
import { NextResponse } from "next/server";
import { getProduct } from "@/data/products";
import { createOrder } from "@/lib/orders";
import type { OrderLine } from "@/lib/order-types";
import {
  customDimensionsWithinLimits,
  customSizeRangeMessage,
  isRequestDifferentSizeId,
  parseLabeledCustomSize,
} from "@/lib/custom-size";
import { isHatPomPomId } from "@/lib/hat-pom-pom";
import { isProductTagId } from "@/lib/product-tags";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      customerName?: string;
      customerNote?: string;
      pickupPreference?: string;
      venmoHandle?: string;
      lines?: OrderLine[];
    };

    if (!body.customerName?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (!body.lines?.length) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    const lines: OrderLine[] = body.lines.map((line) => ({
      kind: line.kind === "pattern_request" ? "pattern_request" : "catalog",
      productId: String(line.productId),
      productName: String(line.productName),
      sizeId: String(line.sizeId),
      sizeLabel: String(line.sizeLabel),
      yarnId: String(line.yarnId),
      yarnName: String(line.yarnName),
      tagId:
        line.tagId && isProductTagId(String(line.tagId))
          ? line.tagId
          : undefined,
      tagLabel: line.tagLabel ? String(line.tagLabel) : undefined,
      pomPomId:
        line.pomPomId && isHatPomPomId(String(line.pomPomId))
          ? line.pomPomId
          : undefined,
      pomPomLabel: line.pomPomLabel ? String(line.pomPomLabel) : undefined,
      quantity: Math.max(1, Number(line.quantity) || 1),
      unitPrice: line.priceTbd ? 0 : Number(line.unitPrice) || 0,
      priceTbd: !!line.priceTbd,
      patternName: line.patternName,
      designerName: line.designerName,
      patternUrl: line.patternUrl ?? null,
    }));

    for (const line of lines) {
      if (!isRequestDifferentSizeId(line.sizeId)) continue;
      const limits = getProduct(line.productId)?.customSizeLimits;
      if (!limits) continue;
      const dimensions = parseLabeledCustomSize(line.sizeLabel);
      if (!dimensions) {
        return NextResponse.json(
          { error: "Enter valid width and height." },
          { status: 400 }
        );
      }
      if (!customDimensionsWithinLimits(dimensions, limits)) {
        return NextResponse.json(
          { error: customSizeRangeMessage(limits) },
          { status: 400 }
        );
      }
    }

    const catLines = lines.filter(line => line.productId === "cat-cave");
    if (catLines.length) {
      const snapshot = await readBernatStock();
      const requested = new Map<string, number>();
      for (const line of catLines) {
        const yarn = getProduct("cat-cave")?.yarns.find(yarn => yarn.id === line.yarnId);
        const sku = yarn?.supplierSku?.split(":")[1];
        if (!sku || !Number.isSafeInteger(line.quantity) || !availableForCatCave(snapshot, sku)) {
          return NextResponse.json({ error: "That cat cave yarn is no longer available. Please choose another color." }, { status: 409 });
        }
        requested.set(sku, (requested.get(sku) ?? 0) + line.quantity * MIN_SKEINS);
      }
      for (const [sku, needed] of requested) {
        if ((snapshot?.quantities[sku] ?? 0) < needed) {
          return NextResponse.json({ error: "There is not enough yarn for that many cat caves. Please reduce the quantity or choose another color." }, { status: 409 });
        }
      }
    }

    const order = await createOrder({
      customerName: body.customerName.trim(),
      customerNote: body.customerNote?.trim(),
      pickupPreference: body.pickupPreference?.trim(),
      venmoHandle: body.venmoHandle,
      lines,
    });

    return NextResponse.json({ order });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Could not save request" },
      { status: 500 }
    );
  }
}
