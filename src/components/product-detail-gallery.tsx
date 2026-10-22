"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { GallerySlideImage } from "@/components/gallery-slide-image";
import type { ProductImage } from "@/data/products";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { cn } from "@/lib/utils";

type Props = {
  /** Product photos, product videos, then selected supplier yarn images. */
  slides: ProductImage[];
  keyboardNavigation?: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Temporarily shown in the main slot (e.g. while hovering a color swatch). */
  preview?: ProductImage | null;
  className?: string;
};

export function ProductDetailGallery({
  slides,
  keyboardNavigation = true,
  activeIndex,
  onSelect,
  preview,
  className,
}: Props) {
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;
  const active = preview ?? slides[activeIndex] ?? slides[0];

  const overlayCaption = !!active?.shownColor;

  const prev = () => onSelect((activeIndex - 1 + count) % count);
  const next = () => onSelect((activeIndex + 1) % count);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 40 || count < 2) return;
    if (dx < 0) next();
    else prev();
  }

  // Touch phones/tablets: swipe + dots only. Narrow desktop window + mouse: hover arrows.
  const arrowClass =
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-ink shadow backdrop-blur-sm transition-colors hover:bg-white fine-pointer:flex fine-pointer:opacity-0 fine-pointer:transition-opacity fine-pointer:group-hover:opacity-100" + (keyboardNavigation ? " focus-visible:opacity-100" : "");

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <figure
        className={cn(
          "group relative aspect-square overflow-hidden rounded-[8px]",
          productPhotoBgClass
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {active?.type === "video" ? (
          <video
            key={active.src}
            src={active.src}
            poster={active.poster}
            aria-label={active.alt}
            autoPlay
            muted
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
          />
        ) : active && (
          <GallerySlideImage
            key={active.src}
            src={active.src}
            alt={active.alt}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            galleryMatteInset={active.galleryMatteInset}
          />
        )}

        {overlayCaption && (
          <figcaption className={cn("pointer-events-none absolute right-3 left-3 z-10 flex justify-end md:right-4 md:left-4", active?.type === "video" ? "bottom-16" : "bottom-3 md:bottom-4")}>
            <span className="max-w-full rounded-[8px] bg-white px-3 py-2 text-center text-sm leading-5 text-[#595959] [overflow-wrap:anywhere]">
              <span className="text-black">{active.shownColor}</span>
            </span>
          </figcaption>
        )}

        {count > 1 && (
          <>
            <button type="button" aria-label="Previous gallery item" onClick={prev} className={`${arrowClass} left-3`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next gallery item" onClick={next} className={`${arrowClass} right-3`}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className={cn("absolute left-1/2 z-10 flex -translate-x-1/2 gap-2", active?.type === "video" ? "top-4" : "bottom-4")}>
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`View ${slide.type === "video" ? "video" : "image"} ${i + 1}`}
                  tabIndex={keyboardNavigation ? -1 : undefined}
                  onClick={() => onSelect(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === activeIndex
                      ? "w-4 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </figure>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto p-1 -m-1" role={keyboardNavigation ? "group" : undefined} aria-label={keyboardNavigation ? "Product photos — use left and right arrows" : undefined}
          onKeyDown={keyboardNavigation ? (e) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
            const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
            const current = buttons.indexOf(e.target as HTMLButtonElement);
            if (current < 0) return;
            e.preventDefault();
            const index = e.key === "Home" ? 0 : e.key === "End" ? count - 1 : (current + (e.key === "ArrowRight" ? 1 : -1) + count) % count;
            onSelect(index);
            buttons[index]?.focus({ preventScroll: true });
            buttons[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
          } : undefined}>
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={slide.alt}
              tabIndex={keyboardNavigation ? (i === activeIndex ? 0 : -1) : undefined}
              aria-pressed={keyboardNavigation ? i === activeIndex : undefined}
              onClick={() => onSelect(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-[8px] transition-opacity md:w-20",
                productPhotoBgClass,
                i === activeIndex
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-80"
              )}
            >
              <GallerySlideImage
                src={slide.type === "video" ? slide.poster! : slide.src}
                alt={slide.alt}
                sizes="80px"
                galleryMatteInset={slide.galleryMatteInset}
              />
              {slide.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                  <Play className="h-7 w-7 fill-white text-white drop-shadow" aria-hidden="true" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}


    </div>
  );
}
