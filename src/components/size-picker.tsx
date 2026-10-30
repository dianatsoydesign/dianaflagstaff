"use client";

import { useEffect, useRef } from "react";
import {
  careSurfaceClass,
  careSurfaceHoverClass,
  pickerChipBase,
  pickerChipGroupClass,
  pickerFieldsetClass,
  pickerLegendClass,
  formFieldInputClass,
} from "@/components/picker-styles";
import { cn } from "@/lib/utils";
import { CompactSizePicker } from "@/components/compact-size-picker";
import { sizeOptionLabel } from "@/lib/size-option-label";
import { type SizeOption } from "@/data/products";
import {
  REQUEST_DIFFERENT_SIZE_ID,
  customDimensionsWithinLimits,
  customSizeRangeMessage,
  dimensionWithinLimits,
  formatCustomSizeLabel,
  isRequestDifferentSizeId,
  parseDimensionInches,
  sanitizeDimensionInput,
  sizesIncludeCustomRequest,
  type CustomSizeDimensions,
  type CustomSizeLimits,
} from "@/lib/custom-size";

const dimensionInputClass = cn(
  formFieldInputClass,
  "h-12 w-full rounded-[8px] tabular-nums",
  "border-border focus:border-ink focus-visible:border-ink",
  "focus:ring-0 focus-visible:ring-0"
);

type Props = {
  sizes: SizeOption[];
  basePrice?: number;
  priceSuffix?: string;
  value: string | null;
  onChange: (sizeId: string) => void;
  /** Renders a second chip after preset sizes (hotpads). */
  allowRequestDifferentSize?: boolean;
  customDimensions?: CustomSizeDimensions;
  onCustomDimensionsChange?: (dimensions: CustomSizeDimensions) => void;
  /** Inclusive inch bounds for each custom side (hotpads). */
  customSizeLimits?: CustomSizeLimits;
  /** Calculated unit price from the purchase form; absent means quote required. */
  customSizePrice?: number;
};

export function SizePicker({
  sizes,
  basePrice,
  priceSuffix = "",
  value,
  onChange,
  allowRequestDifferentSize = false,
  customDimensions = { width: "", height: "" },
  onCustomDimensionsChange,
  customSizeLimits,
  customSizePrice,
}: Props) {
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = chipsRef.current;
    const selectedChip = container?.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    if (!container || !selectedChip) return;
    const bounds = container.getBoundingClientRect();
    const chip = selectedChip.getBoundingClientRect();
    if (chip.left < bounds.left + 6) container.scrollLeft -= bounds.left + 6 - chip.left;
    else if (chip.right > bounds.right - 6) container.scrollLeft += chip.right - bounds.right + 6;
  }, [value]);

  const presetSizes = sizes.filter((s) => !isRequestDifferentSizeId(s.id));
  const showCustomChip =
    allowRequestDifferentSize || sizesIncludeCustomRequest(sizes);
  const customSelected = value != null && isRequestDifferentSizeId(value);
  const selected = presetSizes.find((s) => s.id === value);
  const customInRange =
    !customSizeLimits ||
    customDimensionsWithinLimits(customDimensions, customSizeLimits);
  const customLabel =
    customSelected &&
    customDimensions.width.trim() &&
    customDimensions.height.trim() &&
    customInRange
      ? formatCustomSizeLabel(customDimensions)
      : null;
  const rangeMessage = customSizeLimits
    ? customSizeRangeMessage(customSizeLimits)
    : null;

  function sideOutOfRange(raw: string): boolean {
    if (!customSizeLimits || !raw.trim()) return false;
    const inches = parseDimensionInches(raw);
    if (inches === null) return false;
    return !dimensionWithinLimits(inches, customSizeLimits);
  }

  const rangeError =
    sideOutOfRange(customDimensions.width) ||
    sideOutOfRange(customDimensions.height);

  // Long lists use a compact selector; short lists keep all size chips browsable.
  if (presetSizes.length > 5 && !showCustomChip && basePrice !== undefined) {
    return <CompactSizePicker sizes={presetSizes} value={value} basePrice={basePrice} priceSuffix={priceSuffix} onChange={onChange} />;
  }
  const pricesDiffer = basePrice !== undefined && new Set(presetSizes.map(size => size.priceTbd ? "TBD" : size.price ?? basePrice)).size > 1;

  return (
    <fieldset className={pickerFieldsetClass}>
      <legend className={pickerLegendClass}>
        Size:{" "}
        {customSelected ? (
          <span className="font-medium text-foreground">{sizeOptionLabel({
            id: REQUEST_DIFFERENT_SIZE_ID,
            label: customLabel ?? "Request different size",
            price: customLabel ? customSizePrice : undefined,
            priceTbd: !customLabel || customSizePrice === undefined,
          }, undefined, priceSuffix)}</span>
        ) : selected ? (
          <span className="font-medium text-foreground">{sizeOptionLabel(selected, basePrice, priceSuffix)}</span>
        ) : null}
      </legend>
      <div
        ref={chipsRef}
        className={cn(pickerChipGroupClass, "relative z-10 -m-1.5 flex-nowrap overflow-x-auto p-1.5 pb-3")}
        onFocus={event => {
          const container = event.currentTarget;
          const chip = (event.target as HTMLElement).getBoundingClientRect();
          const bounds = container.getBoundingClientRect();
          if (chip.left < bounds.left + 6) container.scrollLeft -= bounds.left + 6 - chip.left;
          else if (chip.right > bounds.right - 6) container.scrollLeft += chip.right - bounds.right + 6;
        }}
        role="radiogroup"
        aria-label="Size"
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
          const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'));
          const current = buttons.indexOf(e.target as HTMLButtonElement);
          if (current < 0 || !buttons.length) return;
          e.preventDefault();
          const index = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (current + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + buttons.length) % buttons.length;
          buttons[index].focus({ preventScroll: true });
          buttons[index].click();
        }}
      >
        {presetSizes.map((size) => {
          const isSelected = value === size.id;
          return (
            <button
              key={size.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || (!value && size.id === presetSizes[0]?.id) ? 0 : -1}
              onClick={() => onChange(size.id)}
              className={cn(
                pickerChipBase,
                "max-w-none whitespace-nowrap",
                isSelected
                  ? cn("border-ink font-medium", careSurfaceClass)
                  : cn(
                      "border-border bg-card/80",
                      "hover:border-ink/40",
                      careSurfaceHoverClass,
                      "active:bg-[#e8e8e8] dark:active:bg-[#141414]"
                    )
              )}
            >
              {pricesDiffer ? sizeOptionLabel(size, basePrice, priceSuffix) : size.label}
            </button>
          );
        })}
        {showCustomChip ? (
          <button
            type="button"
            role="radio"
            aria-checked={customSelected}
            tabIndex={customSelected ? 0 : -1}
            onClick={() => onChange(REQUEST_DIFFERENT_SIZE_ID)}
            className={cn(
              pickerChipBase,
              "max-w-none whitespace-nowrap",
              customSelected
                ? cn("border-ink font-medium", careSurfaceClass)
                : cn(
                    "border-border bg-card/80",
                    "hover:border-ink/40",
                    careSurfaceHoverClass,
                    "active:bg-[#e8e8e8] dark:active:bg-[#141414]"
                  )
            )}
          >
            Request different size
          </button>
        ) : null}
      </div>
      {showCustomChip && customSelected ? (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-w-0 flex-col gap-3 text-sm">
              <span className="text-muted-foreground">Width (inches)</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={customDimensions.width}
                aria-invalid={sideOutOfRange(customDimensions.width)}
                aria-describedby={rangeError ? "custom-size-range" : undefined}
                onChange={(e) =>
                  onCustomDimensionsChange?.({
                    ...customDimensions,
                    width: sanitizeDimensionInput(e.target.value),
                  })
                }
                className={dimensionInputClass}
                placeholder="7–10"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-3 text-sm">
              <span className="text-muted-foreground">Height (inches)</span>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={customDimensions.height}
                aria-invalid={sideOutOfRange(customDimensions.height)}
                aria-describedby={rangeError ? "custom-size-range" : undefined}
                onChange={(e) =>
                  onCustomDimensionsChange?.({
                    ...customDimensions,
                    height: sanitizeDimensionInput(e.target.value),
                  })
                }
                className={dimensionInputClass}
                placeholder="7–10"
              />
            </label>
          </div>
          {rangeError && rangeMessage ? (
            <p id="custom-size-range" className="mt-2 text-sm text-destructive">
              {rangeMessage} Use up to two decimal places.
            </p>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}
