"use client";

import { OfflineNotice } from "@/components/offline-notice";
import { reportNetworkFailure } from "@/lib/connection-status";
import { CartCat } from "@/components/cart-cat";
import { RequestTextarea } from "@/components/request-textarea";
import { RequestConfirmation } from "@/components/request-confirmation";
import { CustomerContactFields } from "@/components/customer-contact-fields";
import { CART_FIELD_LIMITS, isValidOrderEmail } from "@/lib/cart-field-limits";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { ProductImageBadge } from "@/components/product-image-badge";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { VENMO_HANDLE, formatPriceOrTbd } from "@/data/products";
import { cartQuantityMin, cartQuantityMax, useInquiryCart, type InquiryItem } from "@/lib/inquiry-cart";
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
    restoreItem,
    clear,
    setDrawerOpen,
  } = useInquiryCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  type CartField = "name" | "email" | "pickup" | "note";
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<CartField, string>>>({});
  const [validationAttempt, setValidationAttempt] = useState(0);
  const invalidField = useRef<CartField | null>(null);
  function showFieldErrors(errors: Partial<Record<CartField, string>>) {
    invalidField.current = (["name", "email", "pickup", "note"] as const).find((field) => errors[field]) ?? null;
    setFieldErrors(errors);
    setValidationAttempt((attempt) => attempt + 1);
  }
  function clearFieldError(field: CartField) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }
  useLayoutEffect(() => {
    if (!invalidField.current) return;
    const control = document.getElementById(`cart-${invalidField.current}`);
    control?.focus({ preventScroll: true });
    control?.closest("[data-cart-field]")?.scrollIntoView({ block: "nearest", behavior: "instant" });
    invalidField.current = null;
  }, [fieldErrors, validationAttempt]);
  const [note, setNote] = useState("");
  const [pickup, setPickup] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [removedItems, setRemovedItems] = useState<{ item: InquiryItem; index: number }[]>([]);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const pendingFocus = useRef<{ id: string; restored: boolean } | null>(null);
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    const element = document.getElementById(target.restored ? `cart-item-${target.id}` : target.id);
    const control = target.restored ? element?.querySelector<HTMLInputElement>("input") : element;
    if (control) {
      control.focus();
      pendingFocus.current = null;
    }
  }, [items, removedItems]);

  const [snackbarHovered, setSnackbarHovered] = useState(false);
  const [snackbarFocused, setSnackbarFocused] = useState(false);
  const [pageInactive, setPageInactive] = useState(false);
  useEffect(() => {
    const update = () => setPageInactive(document.hidden || !document.hasFocus());
    document.addEventListener("visibilitychange", update);
    window.addEventListener("blur", update);
    window.addEventListener("focus", update);
    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("blur", update);
      window.removeEventListener("focus", update);
    };
  }, []);
  const latestRemoval = removedItems[0];
  useEffect(() => {
    if (!latestRemoval || snackbarHovered || snackbarFocused || pageInactive || drawerView === "closed" || restoreError) return;
    const timer = window.setTimeout(() => {
      setRemovedItems((prev) => prev.filter((entry) => entry.item.id !== latestRemoval.item.id));
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [latestRemoval, snackbarHovered, snackbarFocused, pageInactive, drawerView, restoreError]);

  function removeWithUndo(item: InquiryItem) {
    const index = items.findIndex((entry) => entry.id === item.id);
    setRemovedItems((prev) => [...prev, { item, index }]);
    setRestoreError(null);
    const nextItem = items[index + 1] ?? items[index - 1];
    removeItem(item.id);
    pendingFocus.current = nextItem
      ? { id: nextItem.id, restored: true }
      : { id: "cart-heading", restored: false };
  }

  function undoRemoval(item: InquiryItem) {
    const removed = removedItems.find((entry) => entry.item.id === item.id);
    if (!removed) return;
    if (!restoreItem(item, removed.index)) {
      setRestoreError(item.id);
      return;
    }
    setRemovedItems((prev) => prev.filter((entry) => entry.item.id !== item.id));
    setRestoreError(null);
    setSnackbarFocused(false);
    setSnackbarHovered(false);
    pendingFocus.current = { id: item.id, restored: true };
  }

  function dismissRemoval() {
    if (!latestRemoval) return;
    setRemovedItems((prev) => prev.filter((entry) => entry.item.id !== latestRemoval.item.id));
    setRestoreError(null);
    setSnackbarFocused(false);
    setSnackbarHovered(false);
    pendingFocus.current = { id: "cart-heading", restored: false };
  }

  const open = drawerView !== "closed";

  async function submit() {
    setError(null);
    const errors: Partial<Record<CartField, string>> = {};
    if (!name.trim()) errors.name = "Enter your name so I know who to meet.";
    if (!isValidOrderEmail(email)) errors.email = "Enter a valid email address.";
    for (const [field, value, limit] of [
      ["name", name, CART_FIELD_LIMITS.customerName],
      ["email", email, CART_FIELD_LIMITS.customerEmail],
      ["pickup", pickup, CART_FIELD_LIMITS.pickupPreference],
      ["note", note, CART_FIELD_LIMITS.customerNote],
    ] as const) {
      if (value.length > limit) errors[field] = `Use ${limit} characters or fewer.`;
    }
    if (Object.keys(errors).length) {
      showFieldErrors(errors);
      return;
    }
    setFieldErrors({});
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
          field?: string;
        } | null;
        const fieldMap: Record<string, CartField> = { customerName: "name", customerEmail: "email", pickupPreference: "pickup", customerNote: "note" };
        if (data?.field && fieldMap[data.field]) {
          showFieldErrors({ [fieldMap[data.field]]: data.error || "Check this field." });
          return;
        }
        throw new Error(data?.error || "Could not send request");
      }
      clear();
      setRemovedItems([]);
      setRestoreError(null);
      setDone(true);
      setName("");
      setEmail("");
      setNote("");
      setPickup("");
    } catch (e) {
      if (!navigator.onLine || e instanceof TypeError) {
        reportNetworkFailure();
        setError("The connection was interrupted. Your cart and details are still here. Check your connection before trying to send the request again.");
      } else {
        setError(e instanceof Error ? e.message : "Could not send your request. Try again.");
      }
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
          <SheetTitle id="cart-heading" tabIndex={-1} className="font-display text-2xl tracking-[-0.04em] text-ink">
            Your cart
          </SheetTitle>
          <SheetDescription className="sr-only">
            Review your items and submit an order request.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 py-4 scroll-py-4 sm:px-5">
          <OfflineNotice compact />
          {done ? (
            <RequestConfirmation onContinue={() => {
              setDone(false);
              setDrawerOpen(false);
              router.push("/");
            }} />
          ) : items.length === 0 ? (
            <div className="flex min-h-[min(50vh,20rem)] flex-col items-center justify-center px-2 py-8 text-center">
              <div className="mb-6 w-full max-w-[468px]"><CartCat /></div>
              <p className="font-display text-3xl font-normal leading-[1.12] tracking-[-0.04em] text-ink">
                Your cart is empty.
              </p>
              <p className="mt-4 font-sans text-lg leading-relaxed text-foreground">
                Just a cat in the bag. For now.
              </p>
              <Button
                type="button"
                className="mt-6 h-12 w-auto rounded-full bg-button px-6 text-base text-button-foreground hover:bg-button-hover"
                onClick={() => {
                  setDrawerOpen(false);
                  router.push("/");
                }}
              >
                Explore the shop
              </Button>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  id={`cart-item-${item.id}`}
                  key={item.id}
                  className="flex flex-wrap sm:grid sm:grid-cols-[10rem_minmax(0,1fr)] items-stretch gap-x-4 gap-y-3 border-b border-border/50 pb-4"
                >
                  <div className={cn("relative aspect-square w-full max-w-40 max-sm:w-[min(33%,10rem)] self-end overflow-hidden rounded-[8px]", productPhotoBgClass)}>
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
                  <div className="flex min-w-0 flex-col break-words max-sm:flex-1 max-sm:basis-[11rem]">
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
                    {cartQuantityMin(item) > 1 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Minimum {cartQuantityMin(item)}
                      </p>
                    )}
                    <div className="mt-auto flex min-w-0 flex-wrap items-end justify-between gap-2 pt-3">
                      <QuantityStepper
                        size="default"
                        className="shrink-0 [&_input]:w-8"
                        inputAriaLabel={`Quantity for ${item.productName}, ${formatLineOptions(item)}, minimum ${cartQuantityMin(item)}`}
                        productContext={`${item.productName}, ${formatLineOptions(item)}`}
                        value={item.quantity}
                        min={cartQuantityMin(item) > 1 ? cartQuantityMin(item) : 0}
                        max={cartQuantityMax(item, items)}
                        lockDecreaseAtMin={cartQuantityMin(item) > 1}
                        onChange={(q) => q <= 0 ? removeWithUndo(item) : updateQuantity(item.id, q)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="ml-auto size-11"
                        aria-label={`Remove ${item.productName}`}
                        onClick={() => removeWithUndo(item)}
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
            <div className="mt-6 flex flex-col gap-5">
              <CustomerContactFields idPrefix="cart" name={name} email={email} fieldErrors={fieldErrors}
                onNameChange={value => { setName(value); clearFieldError("name"); }}
                onEmailChange={value => { setEmail(value); clearFieldError("email"); }} />
              <div data-cart-field="pickup" className="flex scroll-my-4 flex-col gap-3 text-sm">
                <label htmlFor="cart-pickup" className="font-medium">Flagstaff pickup location (optional)</label>
                <div className="relative">
                <input
                  id="cart-pickup"
                  value={pickup}
                  onChange={(e) => { setPickup(e.target.value); clearFieldError("pickup"); }}
                  maxLength={CART_FIELD_LIMITS.pickupPreference}
                  aria-invalid={!!fieldErrors.pickup || undefined}
                  aria-describedby={`cart-pickup-count${fieldErrors.pickup ? " cart-pickup-error" : ""}`}
                  
                  className={cn(formFieldInputClass, "h-12 w-full rounded-[8px] pr-20")}
                  placeholder="Friend meet-up / neighborhood handoff"
                />
                  {pickup.length > 0 && (
                <p id="cart-pickup-count" className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums", pickup.length >= CART_FIELD_LIMITS.pickupPreference ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
                  {pickup.length} / {CART_FIELD_LIMITS.pickupPreference}
                </p>
                  )}
                </div>
                {fieldErrors.pickup && (
                  <p id="cart-pickup-error" role="alert" className="text-left text-sm text-red-700 dark:text-red-400">
                    {fieldErrors.pickup}
                  </p>
                )}
                <span className="sr-only" role="status">
                  {pickup.length >= CART_FIELD_LIMITS.pickupPreference ? "Character limit reached." : ""}
                </span>
              </div>
              <RequestTextarea id="cart-note" label="Notes" value={note} maxLength={CART_FIELD_LIMITS.customerNote} error={fieldErrors.note}
                placeholder="Your phone number (if Diana doesn’t already have it), timing, etc."
                onChange={value => { setNote(value); clearFieldError("note"); }} />
            </div>
          )}
        </div>

        {!done && latestRemoval && (
          <div
            role="region"
            aria-label="Cart update"
            className="mx-4 mb-3 flex shrink-0 items-center gap-2 rounded-[8px] bg-button px-3 py-2 text-button-foreground shadow-lg sm:mx-5"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                dismissRemoval();
              }
            }}
            onMouseEnter={() => setSnackbarHovered(true)}
            onMouseLeave={() => setSnackbarHovered(false)}
            onFocusCapture={() => setSnackbarFocused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSnackbarFocused(false);
            }}
          >
            <div className="min-w-0 flex-1">
              <p key={latestRemoval.item.id} role="status" aria-atomic="true" className="text-left text-sm">{latestRemoval.item.productName} removed.</p>
              {restoreError === latestRemoval.item.id && (
                <p role="alert" className="mt-1 text-sm text-red-300 dark:text-red-700">
                  Reduce the other quantities for this size before restoring this item.
                </p>
              )}
            </div>
            <Button type="button" variant="ghost" className="h-11 shrink-0 rounded-full px-3 font-semibold text-button-foreground underline underline-offset-2 hover:bg-button-hover hover:text-button-foreground focus-visible:outline-2 focus-visible:outline-current" onClick={() => undoRemoval(latestRemoval.item)}>
              Undo
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label="Dismiss cart notification"
              className="size-11 shrink-0 rounded-full text-button-foreground hover:bg-button-hover hover:text-button-foreground focus-visible:outline-2 focus-visible:outline-current"
              onClick={dismissRemoval}>
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        )}

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
            {error && (
              <p className="text-left text-sm text-red-700 dark:text-red-400" role="alert">
                {error}
              </p>
            )}
            <div className="grid w-full grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-12 min-w-0 whitespace-normal rounded-full px-2 py-3 text-sm sm:text-base"
                onClick={() => handleOpenChange(false)}
              >
                Keep shopping
              </Button>
              <Button
                type="button"
                aria-describedby="cart-payment-note"
                className="h-auto min-h-12 min-w-0 whitespace-normal rounded-full bg-button px-2 py-3 text-sm text-button-foreground hover:bg-button-hover sm:text-base"
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
