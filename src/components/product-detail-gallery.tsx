"use client";

import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Play, Plus } from "lucide-react";
import { ArtImageViewer } from "@/components/art-image-viewer";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { GallerySlideImage } from "@/components/gallery-slide-image";
import type { ProductImage } from "@/data/products";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { sentenceCaseColorName } from "@/lib/color-name";
import { useViewerHistory } from "@/lib/use-viewer-history";
import { cn } from "@/lib/utils";

type Props = {
  /** Cover photo, primary video, remaining photos/videos, then supplier yarn images. */
  slides: ProductImage[];
  /** Make product video easier to discover. */
  emphasizeVideo?: boolean;
  zoomImages?: boolean;
  keyboardNavigation?: boolean;
  /** Only the full-size image pins on mobile; thumbnails stay in page flow. */
  pinOnMobile?: boolean;
  activeIndex: number;
  onSelect: (index: number) => void;
  /** Temporarily shown in the main slot (e.g. while hovering a color swatch). */
  preview?: ProductImage | null;
  className?: string;
};

export function ProductDetailGallery({
  slides,
  emphasizeVideo = false,
  zoomImages = false,
  keyboardNavigation = true,
  pinOnMobile = false,
  activeIndex,
  onSelect,
  preview,
  className,
}: Props) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef(0);
  const movedTouch = useRef(false);
  const [zoomPhoto, setZoomPhoto] = useViewerHistory("product-gallery");
  const count = slides.length;
  const videoIndex = slides.findIndex(slide => slide.type === "video");
  const active = preview ?? slides[activeIndex] ?? slides[0];

  const zoomEnabled = zoomImages && !!active && active.type !== "video";

  const overlayCaption = !!(active?.shownColor || active?.shownStyle);

  const prev = () => onSelect((activeIndex - 1 + count) % count);
  const next = () => onSelect((activeIndex + 1) % count);

  function handleTouchStart(e: React.TouchEvent) {
    movedTouch.current = false;
    touchStartX.current = e.touches.length === 1 ? e.touches[0].clientX : null;
    touchStartY.current = e.touches[0].clientY;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    movedTouch.current = movedTouch.current || Math.hypot(dx, dy) > 10;
    touchStartX.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dy) >= Math.abs(dx) || count < 2) return;
    if (dx < 0) next();
    else prev();
  }

  const arrowClass = cn(
    "absolute top-1/2 z-10 h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-black shadow transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
    pinOnMobile
      ? "flex max-md:h-11 max-md:w-11 md:opacity-0 md:group-hover:opacity-100"
      : "hidden fine-pointer:flex fine-pointer:opacity-0 fine-pointer:transition-opacity fine-pointer:group-hover:opacity-100",
    keyboardNavigation && "focus-visible:opacity-100",
  );

  return (
    <div className={cn("flex flex-col gap-3", pinOnMobile && "max-md:contents", className)}>
      <figure
        className={cn(
          "group relative aspect-square overflow-hidden rounded-[8px] md:w-full max-md:-mx-[3vw] max-md:w-screen max-md:rounded-none",
          pinOnMobile && "max-md:order-3 max-md:data-[sticky=true]:sticky max-md:data-[sticky=true]:top-0 max-md:data-[sticky=true]:z-20",
          productPhotoBgClass
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={event => {
          if (touchStartX.current !== null && Math.hypot(event.touches[0].clientX - touchStartX.current, event.touches[0].clientY - touchStartY.current) > 10) movedTouch.current = true;
        }}
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
            className="product-gallery-video h-full w-full object-contain"
          />
        ) : active && zoomEnabled ? (
          <Dialog open={zoomPhoto === active.src} onOpenChange={open => setZoomPhoto(open ? active.src : null)}>
            <DialogTrigger aria-label={`Zoom image: ${active.alt}`} className="absolute inset-0 block cursor-zoom-in focus-visible:z-10 focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground" onClick={event => {
              if (event.detail !== 0 && movedTouch.current) event.preventDefault();
            }}>
              <GallerySlideImage src={active.src} alt={active.alt} priority sizes="(max-width: 768px) 100vw, 50vw" galleryMatteInset={active.galleryMatteInset} />
              <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full bg-white text-black shadow-sm md:right-4 md:top-4">
                <Plus className="size-5" />
              </span>
            </DialogTrigger>
            {zoomPhoto === active.src && <ArtImageViewer photo={{ original: active.src, alt: active.alt, width: 1024, height: 1024 }} viewerLabel="Product image viewer" />}
          </Dialog>
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

        {emphasizeVideo && videoIndex !== -1 && active?.type !== "video" && (
          <Button type="button" variant="outline" className="absolute left-3 top-3 z-10 h-11 gap-2 bg-white px-4 text-black hover:bg-neutral-100 md:hidden" onClick={() => onSelect(videoIndex)}>
            <Play className="size-4" aria-hidden="true" />Watch video
          </Button>
        )}

        {overlayCaption && (
          <figcaption className={cn("pointer-events-none absolute right-3 left-3 z-10 flex justify-end md:right-4 md:left-4", active?.type === "video" ? "bottom-16" : count > 1 ? "bottom-10" : "bottom-3 md:bottom-4")}>
            <span className="max-w-full rounded-[8px] bg-white px-3 py-2 text-left text-sm leading-5 text-[#595959] [overflow-wrap:anywhere]">
              <span className="text-black">{[active.shownColor && sentenceCaseColorName(active.shownColor), active.shownStyle].filter(Boolean).join(" · ")}</span>
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
        <div className={cn("flex min-w-0 gap-2 overflow-x-auto p-1 -m-1 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden", pinOnMobile && "max-md:order-3 max-md:-mt-3")} role={keyboardNavigation ? "group" : undefined} aria-label={keyboardNavigation ? "Product photos — use left and right arrows" : undefined}
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
              aria-label={emphasizeVideo && slide.type === "video" ? `Watch video: ${slide.alt}` : slide.alt}
              tabIndex={keyboardNavigation ? (i === activeIndex ? 0 : -1) : undefined}
              aria-pressed={keyboardNavigation ? i === activeIndex : undefined}
              onClick={() => onSelect(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden rounded-[8px] transition-opacity md:w-20 focus-visible:outline-none! focus-visible:opacity-100 after:pointer-events-none after:absolute after:inset-1 after:z-20 after:rounded-[4px] after:border-2 after:border-transparent focus-visible:after:border-foreground focus-visible:after:ring-2 focus-visible:after:ring-background",
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
                <span className={cn("absolute inset-0 flex items-center justify-center bg-black/15", emphasizeVideo && "flex-col gap-1 bg-black/35")}>
                  <Play className="h-7 w-7 fill-white text-white drop-shadow" aria-hidden="true" />
                  {emphasizeVideo && <span className="rounded bg-black/75 px-1.5 py-0.5 text-xs font-semibold text-white">Video</span>}
                </span>
              )}
            </button>
          ))}
        </div>
      )}


    </div>
  );
}
