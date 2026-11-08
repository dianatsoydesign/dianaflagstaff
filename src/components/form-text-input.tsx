"use client";

import type { InputHTMLAttributes } from "react";
import { formFieldInputClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  value: string;
  maxLength: number;
  /** Text capacity, plus space for input padding and the inset counter. */
  characterWidth?: number;
};

/** Shared cart-style text input with an inset character counter. */
export function FormTextInput({ id, value, maxLength, characterWidth, className, "aria-describedby": describedBy, ...props }: Props) {
  const atLimit = value.length >= maxLength;
  return <>
    <div className="relative max-w-full text-base" style={characterWidth ? { width: `calc(${characterWidth}ch + 6rem)` } : undefined}>
      <input {...props} id={id} value={value} maxLength={maxLength}
        aria-describedby={[value.length > 0 ? `${id}-count` : null, describedBy].filter(Boolean).join(" ") || undefined}
        className={cn(formFieldInputClass, "h-12 w-full rounded-[8px] pr-20", className)} />
      {value.length > 0 && <p id={`${id}-count`} className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums", atLimit ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
        {value.length} / {maxLength}
      </p>}
    </div>
    <span className="sr-only" role="status">{atLimit ? "Character limit reached." : ""}</span>
  </>;
}
