"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function GalleryDots({ labels, activeIndex, onSelect, className }: {
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = rail.current;
    const item = element?.children[activeIndex] as HTMLElement | undefined;
    if (!element || !item) return;
    const left = item.offsetLeft, right = left + item.offsetWidth;
    if (left < element.scrollLeft) element.scrollLeft = left;
    else if (right > element.scrollLeft + element.clientWidth) element.scrollLeft = right - element.clientWidth;
  }, [activeIndex]);
  if (labels.length < 2) return null;
  return <div ref={rail} role="group" aria-label="Photo navigation" className={cn("relative flex w-max max-w-full overflow-x-auto rounded-full bg-black/[0.42] px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)} onKeyDown={event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === "Home" ? 0 : event.key === "End" ? labels.length - 1 : Math.max(0, Math.min(labels.length - 1, activeIndex + (event.key === "ArrowRight" ? 1 : -1)));
    onSelect(index);
    (event.currentTarget.children[index] as HTMLButtonElement)?.focus({ preventScroll: true });
  }}>
    {labels.map((label, index) => <button key={`${index}-${label}`} type="button" aria-label={label} aria-current={index === activeIndex ? "true" : undefined} tabIndex={index === activeIndex ? 0 : -1} onClick={() => onSelect(index)} className="inline-flex size-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white">
      <span aria-hidden="true" className={cn("h-2 rounded-full transition-all motion-reduce:transition-none", index === activeIndex ? "w-4 bg-white" : "w-2 bg-white")} />
    </button>)}
  </div>;
}
