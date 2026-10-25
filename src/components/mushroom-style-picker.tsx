"use client";

import { pickerChipBase, pickerChipGroupClass, pickerFieldsetClass, pickerLegendClass, careSurfaceClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";

const styles = [{ id: "slouchy", label: "Slouchy, long tip", description: "A longer, relaxed witch-hat tip." }, { id: "short-tip", label: "Short tip", description: "A shorter, more compact point." }] as const;
export function MushroomStylePicker({ value, onChange }: { value: "slouchy" | "short-tip"; onChange: (value: "slouchy" | "short-tip") => void }) {
  return <fieldset className={pickerFieldsetClass}>
    <legend className={pickerLegendClass}>Style: <span className="font-medium text-foreground">{styles.find(style => style.id === value)?.label}</span></legend>
    <div className={pickerChipGroupClass}>
      {styles.map(style => <label key={style.id} className={cn(pickerChipBase, "relative cursor-pointer", value === style.id ? `border-ink ${careSurfaceClass}` : "border-border hover:border-ink", "has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-foreground")}>
        <input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="radio" name="mushroom-style" value={style.id} checked={value === style.id} onChange={() => onChange(style.id)} />{style.label}
      </label>)}
    </div>
  </fieldset>;
}
