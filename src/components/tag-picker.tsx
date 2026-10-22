"use client";

import { PRODUCT_TAGS, type ProductTagId } from "@/lib/product-tags";
import { HandmadePrefixLabel } from "@/components/handmade-peaks-icon";
import {
  careSurfaceClass,
  careSurfaceHoverClass,
  pickerChipBase,
  pickerFieldsetClass,
  pickerLegendClass,
} from "@/components/picker-styles";
import { cn } from "@/lib/utils";

type Props = {
  keyboardNavigation?: boolean;
  value: ProductTagId;
  onChange: (tagId: ProductTagId) => void;
  className?: string;
};

export function TagPicker({ value, onChange, className, keyboardNavigation = true }: Props) {
  const selected =
    PRODUCT_TAGS.find((t) => t.id === value) ?? PRODUCT_TAGS[0];

  return (
    <fieldset className={cn(pickerFieldsetClass, className)}>
      <legend className={pickerLegendClass}>
        <span className="sr-only">Tag: </span>
        Tag:{" "}
        <HandmadePrefixLabel
          text={selected.label}
          className="font-medium text-foreground"
        />
      </legend>

      <div
        className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap"
        role="radiogroup"
        aria-label="Tag"
        onKeyDown={keyboardNavigation ? (e) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
          const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
          const current = buttons.indexOf(e.target as HTMLButtonElement);
          if (current < 0) return;
          e.preventDefault();
          const index = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (current + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + buttons.length) % buttons.length;
          buttons[index].focus();
          buttons[index].click();
        } : undefined}
      >
        {PRODUCT_TAGS.map((tag) => {
          const isSelected = value === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={keyboardNavigation ? (isSelected ? 0 : -1) : undefined}
              onClick={() => onChange(tag.id)}
              className={cn(
                pickerChipBase,
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
              <HandmadePrefixLabel
                text={tag.label}
                iconClassName="h-[1.3rem] w-[2.05rem]"
              />
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
