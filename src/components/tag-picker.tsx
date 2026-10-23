"use client";

import { useId } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { PRODUCT_TAGS, type ProductTagId } from "@/lib/product-tags";
import {
  careSurfaceClass,
  careSurfaceHoverClass,
  pickerChipBase,
  pickerChipGroupClass,
  pickerFieldsetClass,
  pickerLegendClass,
} from "@/components/picker-styles";
import { cn } from "@/lib/utils";

type Props = {
  keyboardNavigation?: boolean;
  description?: string;
  value: ProductTagId;
  onChange: (tagId: ProductTagId) => void;
  className?: string;
};

export function TagPicker({ value, onChange, className, keyboardNavigation = true, description }: Props) {
  const descriptionId = useId();
  return (
    <fieldset className={cn(pickerFieldsetClass, className)}>
      <legend className={pickerLegendClass}>
        Faux leather label attached to your item
      </legend>

      <div
        className={pickerChipGroupClass}
        role="radiogroup"
        aria-label="Faux leather label attached to your item"
        aria-describedby={description ? descriptionId : undefined}
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
                "relative w-56 flex-col gap-1 rounded-[12px] p-2",
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
              <span className="relative block aspect-[4/1] w-full overflow-hidden rounded-md">
                <Image
                  src={`/product-labels/${tag.id}-v1.png`}
                  alt=""
                  fill
                  sizes="224px"
                  className="scale-[1.4] object-cover"
                />
              </span>
              <span className="flex w-full items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border",
                    isSelected ? "border-ink bg-ink text-background" : "border-muted-foreground"
                  )}
                >
                  {isSelected ? <Check className="size-3.5" strokeWidth={2.5} /> : null}
                </span>
                <span>{tag.label}</span>
              </span>
            </button>
          );
        })}
      </div>
      {description ? (
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      ) : null}
    </fieldset>
  );
}
