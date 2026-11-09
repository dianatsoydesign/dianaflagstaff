"use client";

import { useId } from "react";
import type { SizeOption } from "@/data/products";
import { formatPrice } from "@/data/products";
import { careSurfaceClass, careSurfaceHoverClass, pickerChipBase, pickerChipGroupClass, pickerFieldsetClass, pickerLegendClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";

export function CozyOptionsPicker({ sizes, value, basePrice, onChange }: {
  sizes: SizeOption[];
  value: string | null;
  basePrice: number;
  onChange: (id: string) => void;
}) {
  const groupId = useId();
  const selected = sizes.find(size => size.id === value) ?? sizes[0];
  const height = selected.id.startsWith("tall-") ? "tall" : "short";
  const bottom = selected.id.endsWith("-with-bottom") ? "with-bottom" : "bottomless";
  const groups = [
    { label: "Height", value: height, options: [{ id: "short", label: "Short" }, { id: "tall", label: "Tall" }] },
    { label: "Bottom", value: bottom, options: [{ id: "bottomless", label: "Open" }, { id: "with-bottom", label: "Closed" }] },
  ];

  function optionLabel(group: typeof groups[number], option: { id: string; label: string }) {
    const idFor = (id: string) => group.label === "Height" ? `${id}-${bottom}` : `${height}-${id}`;
    const baseline = sizes.find(size => size.id === idFor(group.options[0].id));
    const target = sizes.find(size => size.id === idFor(option.id));
    const extra = (target?.price ?? basePrice) - (baseline?.price ?? basePrice);
    return `${option.label}${extra > 0 ? ` +${formatPrice(extra)}` : ""}`;
  }

  return <div className="flex min-w-0 flex-col gap-8">
    {groups.map(group => <fieldset key={group.label} className={pickerFieldsetClass}>
      <legend className={pickerLegendClass}>{group.label}: <span className="font-medium text-foreground">{optionLabel(group, group.options.find(option => option.id === group.value) ?? group.options[0])}</span></legend>
      <div className={pickerChipGroupClass}>
        {group.options.map(option => <label key={option.id} className={cn(pickerChipBase, "relative cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-foreground", group.value === option.id ? cn("border-ink font-medium", careSurfaceClass) : cn("border-border bg-card/80 hover:border-ink/40 active:bg-[#e8e8e8] dark:active:bg-[#141414]", careSurfaceHoverClass))}>
          <input type="radio" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" name={`${groupId}-${group.label}`} value={option.id} checked={group.value === option.id} onChange={() => {
            const next = group.label === "Height" ? `${option.id}-${bottom}` : `${height}-${option.id}`;
            if (sizes.some(size => size.id === next)) onChange(next);
          }} />
          {optionLabel(group, option)}
        </label>)}
      </div>
    </fieldset>)}
  </div>;
}
