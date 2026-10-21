"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GallerySlideImage } from "@/components/gallery-slide-image";
import type { ProductImage } from "@/data/products";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { cn } from "@/lib/utils";

type Props = {
  /** Product photos first, then the selected color's images. */
  slides: ProductImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Temporarily shown in the main slot (e.g. while hovering a color swatch). */
  preview?: ProductImage | null;
  className?: string;
};

export function ProductDetailGallery({
  slides,
  activeIndex,
  onSelect,
  preview,
  className,
}: Props) {
  const touchStartX = useRef<number | null>(null);
  const count = slides.length;
  const active = preview ?? slides[activeIndex] ?? slides[0];

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
    "absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/80 text-ink shadow backdrop-blur-sm transition-colors hover:bg-white fine-pointer:flex fine-pointer:opacity-0 fine-pointer:transition-opacity fine-pointer:group-hover:opacity-100";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div
        className={cn(
          "group relative aspect-square overflow-hidden rounded-[8px]",
          productPhotoBgClass
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {active && (
          <GallerySlideImage
            key={active.src}
            src={active.src}
            alt={active.alt}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            galleryMatteInset={active.galleryMatteInset}
          />
        )}

        {count > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={prev} className={`${arrowClass} left-3`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Next image" onClick={next} className={`${arrowClass} right-3`}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`View image ${i + 1}`}
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
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {slides.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={slide.alt}
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
                src={slide.src}
                alt={slide.alt}
                sizes="80px"
                galleryMatteInset={slide.galleryMatteInset}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
