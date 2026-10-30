"use client";

import { useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { sizeOptionLabel, sizeOptionPrice } from "@/lib/size-option-label";
import { type SizeOption } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { pickerFieldsetClass, pickerLegendClass } from "@/components/picker-styles";
import { useViewerHistory } from "@/lib/use-viewer-history";
import { cn } from "@/lib/utils";

type Props = {
  sizes: SizeOption[];
  value: string | null;
  basePrice: number;
  priceSuffix?: string;
  onChange: (id: string) => void;
};

export function CompactSizePicker({ sizes, value, basePrice, priceSuffix = "", onChange }: Props) {
  const [open, setOpen] = useViewerHistory("product-size-picker");
  const selectedRef = useRef<HTMLButtonElement>(null);
  const selected = sizes.find(size => size.id === value);
  return (
    <fieldset className={pickerFieldsetClass}>
      <legend className={pickerLegendClass}>Size:{selected && <span className="font-medium text-foreground"> {sizeOptionLabel(selected, basePrice, priceSuffix)}</span>}</legend>
      <Dialog open={open !== null} onOpenChange={next => setOpen(next ? "sizes" : null)}>
        <DialogTrigger render={<Button variant="outline" />} className="min-h-14 w-full justify-between gap-3 whitespace-normal rounded-[8px] border-2 border-ink px-4 py-3 text-left text-base" aria-label={`Size: ${selected ? sizeOptionLabel(selected, basePrice, priceSuffix) : "Choose a size"}`}>
          <span className="min-w-0 flex-1">{selected?.label ?? "Choose a size"}</span>
          {selected && <span className="shrink-0 tabular-nums">{sizeOptionPrice(selected, basePrice, priceSuffix)}</span>}
          <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
        </DialogTrigger>
        <DialogContent showCloseButton={false} initialFocus={selectedRef} className="bottom-0 left-0 top-auto flex max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:max-w-none md:bottom-auto md:left-1/2 md:top-1/2 md:w-[calc(100%-2rem)] md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 motion-reduce:animate-none!">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-3">
            <div>
              <DialogTitle>Choose a size</DialogTitle>
              <DialogDescription className="sr-only">Each size includes its price and available dimensions. Select a size to update your item.</DialogDescription>
            </div>
            <DialogClose render={<Button variant="ghost" size="icon" className="size-11" />} aria-label="Close size selector"><X aria-hidden="true" /></DialogClose>
          </div>
          <ul className="min-h-0 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]" aria-label="Sizes" onKeyDown={event => {
            if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
            const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
            const index = buttons.indexOf(event.target as HTMLButtonElement);
            if (index < 0) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
            buttons[next].focus();
          }}>
            {sizes.map(size => {
              const [name, ...dimensions] = size.label.split(" · ");
              const isSelected = size.id === value;
              return (
                <li key={size.id}>
                  <button ref={isSelected ? selectedRef : undefined} type="button" aria-pressed={isSelected} onClick={() => { onChange(size.id); setOpen(null); }} className={cn("flex min-h-[72px] w-full items-center gap-3 rounded-[8px] px-3 py-3 text-left hover:bg-muted focus-visible:outline-offset-[-3px]!", isSelected && "bg-muted")}>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-medium">{name}</span>
                      <span className="block text-sm text-muted-foreground">{dimensions.join(" · ")}</span>
                    </span>
                    <span className="shrink-0 text-base tabular-nums">{sizeOptionPrice(size, basePrice, priceSuffix)}</span>
                    <span className="inline-flex size-5 shrink-0 items-center justify-center">{isSelected && <Check className="size-5" aria-hidden="true" />}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </fieldset>
  );
}
