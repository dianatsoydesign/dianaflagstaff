"use client";

import Image from "next/image";
import { productZoomInCursor } from "@/lib/zoom-cursor";
import { useEffect, useRef } from "react";

type GalleryImage = { src: string; alt: string };

/** Native momentum scrolling follows touch and trackpad input continuously. */
export function ZoomGalleryStrip({ images, selected, onSelect, onZoom }: {
  images: GalleryImage[];
  selected: string;
  onSelect: (src: string) => void;
  onZoom: (src: string) => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const positioned = useRef(false);
  const reported = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frame = useRef<number | null>(null);
  const animationTarget = useRef<string | null>(null);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  function report() {
    const element = rail.current;
    if (!element) return;
    const items = Array.from(element.querySelectorAll<HTMLButtonElement>("button"));
    if (animationTarget.current) return;
    const bounds = element.getBoundingClientRect();
    const atStart = element.scrollLeft <= 2;
    const atEnd = element.scrollWidth > element.clientWidth && element.scrollLeft >= element.scrollWidth - element.clientWidth - 2;
    const visibleWidth = (item: HTMLElement) => {
      const rect = item.getBoundingClientRect();
      return Math.max(0, Math.min(rect.right, bounds.right) - Math.max(rect.left, bounds.left));
    };
    const nearest = atStart ? items[0] : atEnd ? items.at(-1) : items.reduce<HTMLButtonElement | undefined>((best, item) => {
      if (!best) return item;
      const difference = visibleWidth(item) - visibleWidth(best);
      if (Math.abs(difference) < 1) return item.dataset.src === selected ? item : best;
      return difference > 0 ? item : best;
    }, undefined);
    const src = nearest?.dataset.src;
    if (src && src !== selected) { reported.current = src; onSelect(src); }
  }
  useEffect(() => {
    if (reported.current === selected) { reported.current = null; return; }
    const element = rail.current;
    const item = Array.from(element?.querySelectorAll<HTMLButtonElement>("button") ?? []).find(button => button.dataset.src === selected);
    if (element && item) {
      const target = Math.min(item.offsetLeft, element.scrollWidth - element.clientWidth);
      animationTarget.current = Math.abs(element.scrollLeft - target) > 2 ? selected : null;
      // Returning from zoom remounts the strip. Start on the current image
      // immediately instead of animating past every preceding photo.
      const instant = !positioned.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      element.scrollTo({ left: target, behavior: instant ? "instant" : "smooth" });
      positioned.current = true;
    }
  }, [selected]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, []);
  return <div ref={rail} data-zoom-strip style={{ columnGap: 4 }} className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    onScroll={() => {
      if (frame.current === null) frame.current = requestAnimationFrame(() => { frame.current = null; report(); });
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { animationTarget.current = null; report(); }, 160);
    }}
    onWheel={() => { animationTarget.current = null; }}
    onPointerDown={event => {
      animationTarget.current = null;
      suppressClick.current = false;
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      event.preventDefault(); event.stopPropagation();
      suppressClick.current = false;
      drag.current = { x: event.clientX, scroll: event.currentTarget.scrollLeft, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
    }}
    onPointerMove={event => {
      if (!drag.current) return;
      const delta = event.clientX - drag.current.x;
      if (Math.abs(delta) > 6) { drag.current.moved = true; suppressClick.current = true; }
      if (drag.current.moved) {
        event.currentTarget.style.scrollSnapType = "none";
        event.currentTarget.scrollLeft = drag.current.scroll - delta;
      }
    }}
    onPointerUp={event => {
      const current = drag.current;
      drag.current = null;
      event.currentTarget.style.scrollSnapType = "";
      if (current && !current.moved) {
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLButtonElement>("button[data-src]");
        if (target?.dataset.src) onZoom(target.dataset.src);
        suppressClick.current = true;
      }
    }}
    onPointerCancel={event => { drag.current = null; suppressClick.current = true; event.currentTarget.style.scrollSnapType = ""; }}
  >{images.map(image => <button key={image.src} data-src={image.src} style={{ cursor: productZoomInCursor }} type="button" tabIndex={-1} aria-label={`Zoom image: ${image.alt}`} className="relative m-0 flex h-full shrink-0 snap-start cursor-zoom-in items-stretch border-0 bg-transparent p-0 leading-none" onClick={() => {
    if (!suppressClick.current) onZoom(image.src);
    suppressClick.current = false;
  }}><Image src={image.src} alt={image.alt} width={1024} height={1024} unoptimized draggable={false} className="block h-full w-auto max-w-none select-none" /></button>)}</div>;
}
