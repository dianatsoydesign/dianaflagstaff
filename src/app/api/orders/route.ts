import { CART_FIELD_LIMITS, isValidOrderEmail, isValidOrderPhone } from "@/lib/cart-field-limits";
import { readBobbinyStock } from "@/lib/bobbiny-stock";
import { availableBobbiny } from "@/lib/bobbiny-inventory.mjs";
import { readCharismaFlagstaffStock } from "@/lib/charisma-flagstaff-stock";
import { charismaRecipe } from "@/lib/charisma-stock-options";
import { availableForCharisma } from "@/lib/charisma-inventory.mjs";
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
      customerEmail?: string;
      customerPhone?: string;
      customerNote?: string;
      pickupPreference?: string;
      venmoHandle?: string;
      lines?: OrderLine[];
    };

    for (const [field, limit] of Object.entries(CART_FIELD_LIMITS)) {
      const value = body[field as keyof typeof CART_FIELD_LIMITS];
      if (value != null && (typeof value !== "string" || value.length > limit)) {
        const label = field === "customerName" ? "Your name" : field === "pickupPreference" ? "Flagstaff pickup location" : field === "customerEmail" ? "Email address" : field === "customerPhone" ? "Phone number" : "Note";
        return NextResponse.json(
          { error: `${label} must be ${limit} characters or fewer.` },
          { status: 400 }
        );
      }
    }

    if (!body.customerName?.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    if (!body.customerEmail || !isValidOrderEmail(body.customerEmail)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (body.customerPhone && !isValidOrderPhone(body.customerPhone)) {
      return NextResponse.json({ error: "Enter a valid phone number or leave it blank." }, { status: 400 });
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
      if (line.kind === "catalog" && !getProduct(line.productId)) {
        return NextResponse.json({ error: "This product is no longer available." }, { status: 400 });
      }
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

    const charismaLines = lines.filter(line => line.productId === "hats" || line.productId === "christmas-stockings");
    if (charismaLines.length) {
      const snapshot = await readCharismaFlagstaffStock();
      const requested = new Map<string, number>();
      for (const line of charismaLines) {
        const minimum = line.productId === "hats" ? 2 : 3;
        const colors = charismaRecipe(line.yarnId);
        if (!colors.length || (line.productId === "hats" && line.yarnId === "stockings-multi") || !Number.isSafeInteger(line.quantity)) {
          return NextResponse.json({ error: "Please choose an available yarn color." }, { status: 409 });
        }
        for (const color of colors) {
          const yarn = getProduct(line.productId)?.yarns.find(yarn => yarn.id === color);
          const sku = yarn?.supplierSku?.split(":")[1];
          if (!sku || !availableForCharisma(snapshot, sku, minimum)) {
            return NextResponse.json({ error: "That yarn is no longer available for this item. Please choose another color." }, { status: 409 });
          }
          requested.set(sku, (requested.get(sku) ?? 0) + line.quantity * minimum);
        }
      }
      for (const [sku, needed] of requested) {
        if ((snapshot?.quantities[sku] ?? 0) < needed) {
          return NextResponse.json({ error: "There is not enough yarn for all items in this color. Please reduce the quantity or choose another color." }, { status: 409 });
        }
      }
    }

    const bobbinyLines = lines.filter(line => getProduct(line.productId)?.yarns.some(yarn => yarn.supplierSku?.startsWith("bobbiny:")));
    if (bobbinyLines.length) {
      const snapshot = await readBobbinyStock();
      for (const line of bobbinyLines) {
        const yarn = getProduct(line.productId)?.yarns.find(yarn => yarn.id === line.yarnId);
        const handle = yarn?.supplierSku?.startsWith("bobbiny:") ? yarn.supplierSku.slice("bobbiny:".length) : null;
        if (!handle || !availableBobbiny(snapshot, handle)) {
          return NextResponse.json({ error: "That Bobbiny yarn is no longer in stock. Please choose another color." }, { status: 409 });
        }
      }
    }

    const order = await createOrder({
      customerName: body.customerName.trim(),
      customerEmail: body.customerEmail.trim(),
      customerPhone: body.customerPhone?.trim() || undefined,
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
