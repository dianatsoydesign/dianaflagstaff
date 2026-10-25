"use client";

import { useEffect, useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { formFieldSurfaceClass } from "@/components/picker-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function clampQuantity(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** When true, − is disabled at `min` (product page). Cart allows − at 1 to remove. */
  lockDecreaseAtMin?: boolean;
  inputAriaLabel?: string;
  productContext?: string;
  className?: string;
  size?: "default" | "compact";
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  lockDecreaseAtMin = true,
  inputAriaLabel = "Quantity",
  productContext,
  className,
  size = "default",
}: Props) {
  const inputId = useId();
  const [draft, setDraft] = useState<string | null>(null);

  useEffect(() => {
    setDraft(null);
  }, [value]);

  const display = draft ?? String(value);
  const atMin = value <= min;
  const atMax = value >= max;

  const controlHeight = size === "compact" ? "h-9" : "h-11";
  const buttonSize = size === "compact" ? "size-9" : "size-11";
  const inputWidth = size === "compact" ? "w-10" : "w-12";

  function commitDraft(raw: string) {
    const parsed = raw.trim() === "" ? min : Number.parseInt(raw, 10);
    onChange(clampQuantity(parsed, min, max));
    setDraft(null);
  }

  return (
    <div
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-full border-2 border-ink",
        formFieldSurfaceClass,
        "transition-[box-shadow]",
        "focus-within:ring-2 focus-within:ring-ring/50",
        className
      )}
      role="group"
      aria-label={inputAriaLabel}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          buttonSize,
          "shrink-0 rounded-none border-0 shadow-none",
          "hover:bg-muted/80 active:bg-muted"
        )}
        aria-label={productContext ? `Decrease quantity for ${productContext}` : "Decrease quantity"}
        disabled={lockDecreaseAtMin && atMin}
        onClick={() => onChange(clampQuantity(value - 1, min, max))}
      >
        <Minus className="size-4" />
      </Button>
      <input
        id={inputId}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        aria-label={inputAriaLabel}
        className={cn(
          controlHeight,
          inputWidth,
          "shrink-0 border-0 border-x border-border/70 text-center text-sm tabular-nums text-foreground",
          formFieldSurfaceClass,
          "shadow-none outline-none ring-0",
          "focus:border-border/70 focus:outline-none focus:ring-0",
          "focus-visible:border-border/70 focus-visible:outline-none focus-visible:ring-0",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
        value={display}
        onChange={(e) => {
          const next = e.target.value;
          if (next === "" || /^\d+$/.test(next)) {
            setDraft(next);
            if (next !== "") {
              const n = Number.parseInt(next, 10);
              if (Number.isFinite(n)) {
                onChange(clampQuantity(n, min, max));
              }
            }
          }
        }}
        onBlur={() => {
          if (draft !== null) commitDraft(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitDraft(draft ?? String(value));
            (e.target as HTMLInputElement).blur();
          }
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(
          buttonSize,
          "shrink-0 rounded-none border-0 shadow-none",
          "hover:bg-muted/80 active:bg-muted"
        )}
        aria-label={productContext ? `Increase quantity for ${productContext}` : "Increase quantity"}
        disabled={atMax}
        onClick={() => onChange(clampQuantity(value + 1, min, max))}
      >
        <Plus className="size-4" />
      </Button>
    </div>
  );
}
