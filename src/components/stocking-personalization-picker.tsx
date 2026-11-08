"use client";

import {
  careSurfaceClass,
  careSurfaceHoverClass,
  pickerChipBase,
  pickerChipGroupClass,
  pickerFieldsetClass,
  pickerLegendClass,
} from "@/components/picker-styles";
import { STOCKING_PLACEMENTS } from "@/lib/stocking-personalization.mjs";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  topOnly?: boolean;
  onChange: (id: string) => void;
  className?: string;
};

export function StockingPersonalizationPicker({ value, onChange, className, topOnly = false }: Props) {
  const selected =
    STOCKING_PLACEMENTS.find((o) => o.id === value) ??
    STOCKING_PLACEMENTS.find((o) => o.id === "none") ??
    STOCKING_PLACEMENTS[0];

  return (
    <fieldset className={cn(pickerFieldsetClass, className)}>
      <legend className={pickerLegendClass}>
        Personalization (optional):{" "}
        <span className="font-medium text-foreground">{selected.label}</span>
      </legend>
      <div
        className={pickerChipGroupClass}
        role="radiogroup"
        aria-label="Personalization (optional)"
        onKeyDown={(e) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
          const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'));
          const current = buttons.indexOf(e.target as HTMLButtonElement);
          if (current < 0 || !buttons.length) return;
          e.preventDefault();
          const index = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (current + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + buttons.length) % buttons.length;
          buttons[index].focus();
          buttons[index].click();
        }}
      >
        {STOCKING_PLACEMENTS.filter(option => !topOnly || option.id === "none" || option.id === "top").map((option) => {
          const isSelected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected || false ? 0 : -1}
              onClick={() => onChange(option.id)}
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
              {option.label}{option.id !== "none" ? " +$5" : ""}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
