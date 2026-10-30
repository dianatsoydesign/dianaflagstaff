"use client";

import { useId } from "react";
import { pickerFieldsetClass, pickerLegendClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "@/components/quantity-stepper";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  label?: string;
  className?: string;
};

export function QuantityPicker({
  value,
  onChange,
  min = 1,
  max,
  label = "Quantity",
  className,
}: Props) {
  const minimumDescriptionId = useId();
  return (
    <fieldset className={cn(pickerFieldsetClass, className)}>
      <legend className={pickerLegendClass}>{label}:</legend>
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          className="shrink-0"
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          lockDecreaseAtMin
          inputDescriptionId={min > 1 ? minimumDescriptionId : undefined}
          inputAriaLabel={`${label}, minimum ${min}, maximum ${max}`}
        />
        {min > 1 && (
          <p id={minimumDescriptionId} className="text-sm text-muted-foreground">
            Minimum {min}
          </p>
        )}
      </div>
    </fieldset>
  );
}
