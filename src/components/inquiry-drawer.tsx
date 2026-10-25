"use client";

import { CART_FIELD_LIMITS, isValidOrderEmail } from "@/lib/cart-field-limits";
import { useRef, useState } from "react";
import Image from "next/image";
import { ProductImageBadge } from "@/components/product-image-badge";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { VENMO_HANDLE, formatPriceOrTbd } from "@/data/products";
import { cartQuantityMax, useInquiryCart } from "@/lib/inquiry-cart";
import { formatLineOptions, productShowsSize } from "@/lib/line-options";
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
    updateQuantity,
    removeItem,
    clear,
    setDrawerOpen,
  } = useInquiryCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contactError, setContactError] = useState<"email" | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [pickup, setPickup] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = drawerView !== "closed";

  async function submit() {
    setError(null);
    setContactError(null);
    if (!name.trim()) {
      setError("Please add your name so Diana knows who to meet.");
      return;
    }
    if (!isValidOrderEmail(email)) {
      setContactError("email");
      emailRef.current?.focus();
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
          customerEmail: email.trim(),
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
      setEmail("");
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
        className="flex !h-dvh !w-full !max-w-none flex-col gap-0 overflow-hidden border-border p-0 motion-reduce:transition-none data-[side=right]:!translate-x-0 sm:!w-xl sm:!max-w-xl lg:!w-2xl lg:!max-w-2xl [&>[data-slot=sheet-close]]:size-11"
        showCloseButton
      >
        <SheetHeader className="shrink-0 border-b border-border/60 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] pr-16 sm:px-5">
          <SheetTitle className="font-display text-2xl tracking-[-0.04em] text-ink">
            Your cart
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your items and submit an order request.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 scroll-py-4 sm:px-5">
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
                  className="grid grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] items-start gap-x-3 gap-y-3 border-b border-border/50 pb-4"
                >
                  <div className={cn("relative aspect-square w-full max-w-40 self-start overflow-hidden rounded-[8px] sm:row-span-2", productPhotoBgClass)}>
                    <Image
                      src={
                        item.productImageSrc ?? item.yarnSwatchSrc
                      }
                      alt={item.productName}
                      fill
                      className="object-contain"
                      sizes="(min-width: 640px) 160px, 38vw"
                    />
                    <ProductImageBadge src={item.productImageSrc} compact />
                  </div>
                  <div className="min-w-0 break-words">
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
                      {formatLineOptions({ ...item, tagLabel: undefined })}
                    </p>
                    <p className="mt-1 text-sm tabular-nums">
                      {formatPriceOrTbd(!!item.priceTbd, item.unitPrice)}
                    </p>
                    {item.quantityMax == null && item.quantity >= cartQuantityMax(item, items) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {productShowsSize(item.productId, item.kind)
                          ? "Maximum 2 per size across colors and options."
                          : "Maximum 2 across colors and options."}
                      </p>
                    )}
                  </div>
                    <div className="col-span-2 flex min-w-0 flex-wrap items-end justify-between gap-2 sm:col-span-1 sm:col-start-2">
                      <QuantityStepper
                        size="default"
                        value={item.quantity}
                        min={0}
                        max={cartQuantityMax(item, items)}
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
                </li>
              ))}
            </ul>
          )}

          {!done && items.length > 0 && (
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 text-sm">
                <label htmlFor="cart-name" className="font-medium">Your name (required)</label>
                <div className="relative">
                <input
                  id="cart-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={CART_FIELD_LIMITS.customerName}
                  aria-describedby="cart-name-count"
                  autoComplete="name"
                  className={cn(formFieldInputClass, "h-12 w-full rounded-[8px] pr-20")}
                  placeholder="So we know who to meet"
                />
                  {name.length > 0 && (
                <p id="cart-name-count" className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums", name.length >= CART_FIELD_LIMITS.customerName ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
                  {name.length} / {CART_FIELD_LIMITS.customerName}
                </p>
                  )}
                </div>
                <span className="sr-only" role="status">
                  {name.length >= CART_FIELD_LIMITS.customerName ? "Character limit reached." : ""}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <label htmlFor="cart-email" className="font-medium">Email address (required)</label>
                <div className="relative">
                <input
                  ref={emailRef}
                  id="cart-email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (contactError === "email") setContactError(null); }}
                  maxLength={CART_FIELD_LIMITS.customerEmail}
                  aria-invalid={contactError === "email" || undefined}
                  aria-describedby={`cart-email-count${contactError === "email" ? " cart-email-error" : ""}`}
                  className={cn(formFieldInputClass, "h-12 w-full rounded-[8px] pr-20")}
                />
                  {email.length > 0 && (
                <p id="cart-email-count" className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums", email.length >= CART_FIELD_LIMITS.customerEmail ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
                  {email.length} / {CART_FIELD_LIMITS.customerEmail}
                </p>
                  )}
                </div>
                {contactError === "email" && (
                  <p id="cart-email-error" role="alert" className="text-left text-sm text-red-700 dark:text-red-400">
                    Enter a valid email address.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <label htmlFor="cart-pickup" className="font-medium">Flagstaff pickup location (optional)</label>
                <div className="relative">
                <input
                  id="cart-pickup"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  maxLength={CART_FIELD_LIMITS.pickupPreference}
                  aria-describedby="cart-pickup-count"
                  
                  className={cn(formFieldInputClass, "h-12 w-full rounded-[8px] pr-20")}
                  placeholder="Friend meet-up / neighborhood handoff"
                />
                  {pickup.length > 0 && (
                <p id="cart-pickup-count" className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums", pickup.length >= CART_FIELD_LIMITS.pickupPreference ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
                  {pickup.length} / {CART_FIELD_LIMITS.pickupPreference}
                </p>
                  )}
                </div>
                <span className="sr-only" role="status">
                  {pickup.length >= CART_FIELD_LIMITS.pickupPreference ? "Character limit reached." : ""}
                </span>
              </div>
              <div className="flex flex-col gap-1.5 text-sm">
                <label htmlFor="cart-note" className="font-medium">Notes (optional)</label>
                <div className="relative">
                <textarea
                  id="cart-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={CART_FIELD_LIMITS.customerNote}
                  aria-describedby="cart-note-count"
                  rows={3}
                  className={cn(formFieldInputClass, "w-full rounded-[8px] pb-8 pt-2.5")}
                  placeholder="Your phone number (if Diana doesn’t already have it), timing, etc."
                />
                  {note.length > 0 && (
                <p id="cart-note-count" className={cn("pointer-events-none absolute right-3 bottom-2 text-xs tabular-nums", note.length >= CART_FIELD_LIMITS.customerNote ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
                  {note.length} / {CART_FIELD_LIMITS.customerNote}
                </p>
                  )}
                </div>
                <span className="sr-only" role="status">
                  {note.length >= CART_FIELD_LIMITS.customerNote ? "Character limit reached." : ""}
                </span>
              </div>
              {error && (
                <p className="text-left text-sm text-red-700 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
            </div>
          )}
        </div>

        {!done && items.length > 0 && (
          <SheetFooter className="shrink-0 gap-2 border-t border-border/60 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:pt-4">
            <div className="flex w-full items-center justify-between text-sm">
              <span className="font-medium text-ink">
                Subtotal ({itemCount} {itemWord})
              </span>
              <span className="font-medium tabular-nums text-ink">
                {formatPriceOrTbd(subtotalTbd, total)}
              </span>
            </div>
            <p id="cart-payment-note" className="text-left text-sm text-muted-foreground">
              Payment due once your order is confirmed.
            </p>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 min-w-0 rounded-full px-2 text-sm sm:text-base"
                onClick={() => handleOpenChange(false)}
              >
                Keep shopping
              </Button>
              <Button
                type="button"
                aria-describedby="cart-payment-note"
                className="h-12 min-w-0 rounded-full bg-button px-2 text-sm text-button-foreground hover:bg-button-hover sm:text-base"
                disabled={submitting}
                onClick={submit}
              >
                {submitting ? "Sending…" : "Send request"}
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
