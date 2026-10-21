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
  value: ProductTagId;
  onChange: (tagId: ProductTagId) => void;
  className?: string;
};

export function TagPicker({ value, onChange, className }: Props) {
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
      >
        {PRODUCT_TAGS.map((tag) => {
          const isSelected = value === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
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
