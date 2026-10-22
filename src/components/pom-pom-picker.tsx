"use client";

import {
  careSurfaceClass,
  careSurfaceHoverClass,
  pickerChipBase,
  pickerChipGroupClass,
  pickerFieldsetClass,
  pickerLegendClass,
} from "@/components/picker-styles";
import {
  DEFAULT_HAT_POM_POM_ID,
  HAT_POM_POM_OPTIONS,
  type HatPomPomId,
} from "@/lib/hat-pom-pom";
import { cn } from "@/lib/utils";

type Props = {
  value: HatPomPomId;
  onChange: (id: HatPomPomId) => void;
  className?: string;
};

export function PomPomPicker({ value, onChange, className }: Props) {
  const selected =
    HAT_POM_POM_OPTIONS.find((o) => o.id === value) ??
    HAT_POM_POM_OPTIONS.find((o) => o.id === DEFAULT_HAT_POM_POM_ID) ??
    HAT_POM_POM_OPTIONS[0];

  return (
    <fieldset className={cn(pickerFieldsetClass, className)}>
      <legend className={pickerLegendClass}>
        <span className="sr-only">Pom pom: </span>
        Pom pom:{" "}
        <span className="font-medium text-foreground">{selected.label}</span>
      </legend>
      <div
        className={pickerChipGroupClass}
        role="radiogroup"
        aria-label="Pom pom"
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
        {HAT_POM_POM_OPTIONS.map((option) => {
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
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
