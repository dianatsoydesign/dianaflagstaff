"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImageBadge } from "@/components/product-image-badge";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { VENMO_HANDLE, formatPriceOrTbd } from "@/data/products";
import { useInquiryCart } from "@/lib/inquiry-cart";
import { formatLineOptions } from "@/lib/line-options";
import { formFieldInputClass } from "@/components/picker-styles";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export function InquiryDrawer() {
  const {
    items,
    itemCount,
    total,
    subtotalTbd,
    drawerView,
    lastAddedItemId,
    updateQuantity,
    removeItem,
    clear,
    setDrawerOpen,
  } = useInquiryCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [pickup, setPickup] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = drawerView !== "closed";
  const addedItem =
    drawerView === "added" && lastAddedItemId
      ? items.find((i) => i.id === lastAddedItemId)
      : null;

  async function submit() {
    setError(null);
    if (!name.trim()) {
      setError("Please add your name so Diana knows who to meet.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item first.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerNote: note.trim() || undefined,
          pickupPreference: pickup.trim() || undefined,
          venmoHandle: VENMO_HANDLE,
          lines: items.map((item) => ({
            kind: item.kind,
            productId: item.productId,
            productName: item.productName,
            sizeId: item.sizeId,
            sizeLabel: item.sizeLabel,
            yarnId: item.yarnId,
            yarnName: item.yarnName,
            tagId: item.tagId,
            tagLabel: item.tagLabel,
            pomPomId: item.pomPomId,
            pomPomLabel: item.pomPomLabel,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            priceTbd: item.priceTbd,
            patternName: item.patternName,
            designerName: item.designerName,
            patternUrl: item.patternUrl,
          })),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Could not send request");
      }
      clear();
      setDone(true);
      setName("");
      setNote("");
      setPickup("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenChange(next: boolean) {
    setDrawerOpen(next);
    if (!next) setDone(false);
  }

  const itemWord = itemCount === 1 ? "item" : "items";

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-[2px]"
        className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden border-border p-0 sm:max-w-xl lg:max-w-2xl"
        showCloseButton
      >
        <SheetHeader className="border-b border-border/60 px-5 pb-4 pt-5">
          <SheetTitle className="font-display text-2xl tracking-[-0.04em] text-ink">
            Your cart
          </SheetTitle>
          <SheetDescription>
            Local pickup only. Venmo when we meet.
          </SheetDescription>
          {addedItem && (
            <p role="status" className="text-sm text-ink">
              Added to cart: {addedItem.productName}
            </p>
          )}
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {done ? (
            <div className="rounded-xl bg-secondary/70 px-4 py-6 text-center">
              <p className="font-display text-xl text-ink">Request sent</p>
              <Button
                className="mt-5 h-11 w-full rounded-full"
                onClick={() => {
                  setDone(false);
                  setDrawerOpen(false);
                }}
              >
                Keep browsing
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-[min(50vh,20rem)] flex-col items-center justify-center px-2 py-8 text-center">
              <img
                src="/illustrations/cat-out-of-bag.gif"
                alt="Cat peeking out of a shopping bag"
                width={800}
                height={600}
                className="mb-6 w-full max-w-[280px] object-contain"
                decoding="async"
              />
              <p className="font-display text-xl text-ink">
                Your cart is empty
              </p>
              <Button
                type="button"
                className="mt-6 h-12 w-full max-w-sm rounded-full bg-button text-base text-button-foreground hover:bg-button-hover"
                onClick={() => {
                  setDrawerOpen(false);
                  router.push("/");
                }}
              >
                Shop now
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 border-b border-border/50 pb-4"
                >
                  <div className={cn("relative size-16 shrink-0 overflow-hidden rounded-sm", productPhotoBgClass)}>
                    <Image
                      src={
                        item.productImageSrc ?? item.yarnSwatchSrc
                      }
                      alt={item.productName}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                    <ProductImageBadge src={item.productImageSrc} compact />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">
                      {item.productName}
                    </p>
                    {item.kind === "pattern_request" && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Made-to-order request
                        {item.patternName ? ` · ${item.patternName}` : ""}
                      </p>
                    )}
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {formatLineOptions(item)}
                    </p>
                    <p className="mt-1 text-sm tabular-nums">
                      {formatPriceOrTbd(!!item.priceTbd, item.unitPrice)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <QuantityStepper
                        size="compact"
                        value={item.quantity}
                        min={0}
                        max={item.quantityMax ?? 99}
                        lockDecreaseAtMin={false}
                        onChange={(q) => updateQuantity(item.id, q)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto size-11"
                        aria-label={`Remove ${item.productName}`}
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!done && items.length > 0 && (
            <div className="mt-6 flex flex-col gap-3">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(formFieldInputClass, "h-12 w-full")}
                  placeholder="So we know who to meet"
                  autoComplete="name"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Pickup preference</span>
                <input
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className={cn(formFieldInputClass, "h-12 w-full")}
                  placeholder="Friend meet-up / neighborhood handoff"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">Note (optional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className={cn(formFieldInputClass, "w-full py-2.5")}
                  placeholder="Timing, color notes, gift wrap…"
                />
              </label>
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {!done && items.length > 0 && (
          <SheetFooter className="gap-3 border-t border-border/60 bg-card px-5 py-4">
            <div className="flex w-full items-center justify-between text-sm">
              <span className="font-medium text-ink">
                Subtotal ({itemCount} {itemWord})
              </span>
              <span className="font-medium tabular-nums text-ink">
                {formatPriceOrTbd(subtotalTbd, total)}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full rounded-full text-base"
              onClick={() => handleOpenChange(false)}
            >
              Continue shopping
            </Button>
            <Button
              type="button"
              className="h-12 w-full rounded-full bg-button text-base text-button-foreground hover:bg-button-hover"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? "Sending…" : "Submit request"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
