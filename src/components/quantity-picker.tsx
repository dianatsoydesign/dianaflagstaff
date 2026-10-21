"use client";

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
  return (
    <fieldset className={cn(pickerFieldsetClass, className)}>
      <legend className={pickerLegendClass}>{label}:</legend>
      <QuantityStepper
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        lockDecreaseAtMin
        inputAriaLabel={label}
      />
    </fieldset>
  );
}
