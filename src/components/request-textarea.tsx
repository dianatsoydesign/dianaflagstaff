"use client";

import { formFieldInputClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  placeholder: string;
  required?: boolean;
  error?: string;
};

/** Shared cart Notes styling and behavior, with context-specific labels and copy. */
export function RequestTextarea({ id, label, value, onChange, maxLength, placeholder, required = false, error }: Props) {
  const atLimit = value.length >= maxLength;
  const describedBy = [value.length > 0 && `${id}-count`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return <div data-cart-field={id === "cart-note" ? "note" : undefined} className="flex scroll-my-4 flex-col gap-3 text-sm">
    <label htmlFor={id} className="font-medium">{label} ({required ? "required" : "optional"})</label>
    <div className="relative">
      <textarea id={id} value={value} onChange={event => onChange(event.target.value)} maxLength={maxLength}
        required={required} aria-invalid={!!error || undefined} aria-describedby={describedBy} rows={3}
        className={cn(formFieldInputClass, "w-full rounded-[8px] pb-8 pt-2.5")} placeholder={placeholder} />
      {value.length > 0 && <p id={`${id}-count`} className={cn("pointer-events-none absolute right-3 bottom-2 text-xs tabular-nums", atLimit ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>{value.length} / {maxLength}</p>}
    </div>
    {error && <p id={`${id}-error`} role="alert" className="text-left text-sm text-red-700 dark:text-red-400">{error}</p>}
    <span className="sr-only" role="status">{atLimit ? "Character limit reached." : ""}</span>
  </div>;
}
