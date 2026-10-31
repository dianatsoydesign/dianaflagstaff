"use client";

import { GalleryDots } from "@/components/gallery-dots";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, ZoomIn } from "lucide-react";
import { ArtImageViewer } from "@/components/art-image-viewer";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { GallerySlideImage } from "@/components/gallery-slide-image";
import type { ProductImage } from "@/data/products";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { sentenceCaseColorName } from "@/lib/color-name";
import { useViewerHistory } from "@/lib/use-viewer-history";
import { productZoomInCursor } from "@/lib/zoom-cursor";
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
  zoomImages = true,
  keyboardNavigation = true,
  pinOnMobile = false,
  activeIndex,
  onSelect,
  preview,
  className,
}: Props) {
  const rail = useRef<HTMLDivElement>(null);
  const movedTouch = useRef(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const reportedIndex = useRef<number | null>(null);
  const scrollFrame = useRef<number | null>(null);
  const [zoomPhoto, setZoomPhoto] = useViewerHistory("product-gallery");
  const zoomTrigger = useRef<HTMLButtonElement>(null);
  const viewerOpen = zoomPhoto !== null;
  useEffect(() => {
    if (!viewerOpen) return;
    // This history entry represents an overlay, not a new scroll destination.
    const restoration = window.history.scrollRestoration;
    const position = { left: window.scrollX, top: window.scrollY };
    window.history.scrollRestoration = "manual";
    return () => {
      window.scrollTo({ ...position, behavior: "instant" });
      window.history.scrollRestoration = restoration;
    };
  }, [viewerOpen]);
  const count = slides.length;
  const videoIndex = slides.findIndex(slide => slide.type === "video");
  const active = preview ?? slides[activeIndex] ?? slides[0];


  const overlayCaption = !!(active?.shownColor || active?.shownStyle);

  const zoomableSlides = slides.map((slide, index) => ({ slide, index })).filter(({ slide }) => slide.type !== "video");
  function navigateZoom(direction: number) {
    const current = zoomableSlides.findIndex(({ slide }) => slide.src === zoomPhoto);
    const target = zoomableSlides[Math.max(0, Math.min(zoomableSlides.length - 1, current + direction))];
    if (!target) return;
    onSelect(target.index);
    setZoomPhoto(target.slide.src);
  }

  const prev = () => onSelect(Math.max(0, activeIndex - 1));
  const next = () => onSelect(Math.min(count - 1, activeIndex + 1));

  useEffect(() => {
    if (reportedIndex.current === activeIndex) { reportedIndex.current = null; return; }
    const element = rail.current;
    const item = element?.children[activeIndex] as HTMLElement | undefined;
    if (element && item) element.scrollTo({ left: item.offsetLeft, behavior: "instant" });
  }, [activeIndex, slides.length]);
  useEffect(() => {
    Array.from(rail.current?.children ?? []).forEach((item, index) => {
      const video = item.querySelector("video");
      if (!video) return;
      if (index === activeIndex) void video.play().catch(() => {});
      else video.pause();
    });
  }, [activeIndex]);
  useEffect(() => () => { if (scrollFrame.current !== null) cancelAnimationFrame(scrollFrame.current); }, []);

  const arrowClass = "inline-flex size-11 shrink-0 cursor-pointer disabled:cursor-default disabled:opacity-40 items-center justify-center rounded-full text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white";

  return (
    <div className={cn("flex flex-col gap-3", pinOnMobile && "max-md:contents", className)}>
      <figure
        className={cn(
          "group relative aspect-square overflow-hidden rounded-[8px] md:w-full max-md:-mx-[3vw] max-md:w-screen max-md:rounded-none",
          pinOnMobile && "max-md:order-3 max-md:data-[sticky=true]:sticky max-md:data-[sticky=true]:top-0 max-md:data-[sticky=true]:z-20",
          productPhotoBgClass
        )}
      >
        <Dialog open={!!zoomPhoto} onOpenChange={open => { if (!open) setZoomPhoto(null); }}>
          <div ref={rail} className={cn("absolute inset-0 flex snap-x snap-mandatory gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", preview && "pointer-events-none opacity-0")}
            onPointerDown={event => { pointerStart.current = { x: event.clientX, y: event.clientY }; movedTouch.current = false; }}
            onPointerMove={event => { const start = pointerStart.current; if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) movedTouch.current = true; }}
            onPointerUp={() => { pointerStart.current = null; }}
            onPointerCancel={() => { pointerStart.current = null; movedTouch.current = true; }}
            onScroll={() => {
              if (scrollFrame.current !== null) return;
              scrollFrame.current = requestAnimationFrame(() => {
                scrollFrame.current = null;
                const element = rail.current;
                if (!element) return;
                const index = Math.max(0, Math.min(slides.length - 1, Math.round(element.scrollLeft / (element.clientWidth + 4))));
                if (index !== activeIndex) { reportedIndex.current = index; onSelect(index); }
              });
            }}>
            {slides.map((slide, index) => <div key={slide.src} className="relative h-full w-full shrink-0 snap-start overflow-hidden">
              {slide.type === "video" ? <video src={slide.src} poster={slide.poster} aria-label={slide.alt} autoPlay={index === activeIndex} muted controls playsInline preload="none" className="product-gallery-video h-full w-full object-contain" /> : zoomImages ? (
                <DialogTrigger ref={index === activeIndex ? zoomTrigger : undefined} aria-label={`Zoom image: ${slide.alt}`} tabIndex={index === activeIndex ? 0 : -1} style={{ cursor: productZoomInCursor }} className="absolute inset-0 block focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground" onClick={event => {
                  if (event.detail !== 0 && movedTouch.current) { event.preventDefault(); return; }
                  onSelect(index); setZoomPhoto(slide.src);
                }}>
                  <GallerySlideImage src={slide.src} alt={slide.alt} priority={index === 0} sizes="(max-width: 768px) 100vw, 50vw" galleryMatteInset={slide.galleryMatteInset} />
                </DialogTrigger>
              ) : <GallerySlideImage src={slide.src} alt={slide.alt} sizes="(max-width: 768px) 100vw, 50vw" galleryMatteInset={slide.galleryMatteInset} />}
            </div>)}
          </div>
          {zoomImages && active && active.type !== "video" && !preview && <button type="button" aria-label="Zoom current image" onClick={() => setZoomPhoto(active.src)} className="absolute right-3 top-3 z-10 size-11 rounded-full bg-black/70 text-white hover:bg-[linear-gradient(rgb(255_255_255_/_15%),rgb(255_255_255_/_15%))] hover:text-white inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white md:right-4 md:top-4"><ZoomIn aria-hidden="true" className="size-5" /></button>}
          {active && active.type !== "video" && <ArtImageViewer showFitButton={false} returnFocusRef={zoomTrigger} photo={{ original: active.src, alt: active.alt, width: 1024, height: 1024 }} viewerLabel="Product image viewer" galleryImages={zoomableSlides.map(({ slide }) => ({ src: slide.src, alt: slide.alt }))} onSelectImage={src => { const index = slides.findIndex(slide => slide.src === src); if (index !== -1) { onSelect(index); setZoomPhoto(src); } }} onPrevious={zoomableSlides.findIndex(({ slide }) => slide.src === active.src) > 0 ? () => navigateZoom(-1) : undefined} onNext={zoomableSlides.findIndex(({ slide }) => slide.src === active.src) < zoomableSlides.length - 1 ? () => navigateZoom(1) : undefined} />}
        </Dialog>
        {preview && <GallerySlideImage src={preview.src} alt={preview.alt} sizes="(max-width: 768px) 100vw, 50vw" galleryMatteInset={preview.galleryMatteInset} />}

        {emphasizeVideo && videoIndex !== -1 && active?.type !== "video" && (
          <Button type="button" variant="outline" className="absolute left-3 top-3 z-10 h-11 gap-2 bg-white px-4 text-black hover:bg-neutral-100 md:hidden" onClick={() => onSelect(videoIndex)}>
            <Play className="size-4" aria-hidden="true" />Watch video
          </Button>
        )}

        {overlayCaption && (
          <figcaption className={cn("pointer-events-none absolute right-3 left-3 z-10 flex justify-end md:right-4 md:left-4", active?.type === "video" ? "bottom-[124px]" : count > 1 ? "bottom-[76px] md:bottom-20" : "bottom-3 md:bottom-4")}>
            <span className="max-w-full rounded-[8px] bg-white px-3 py-2 text-left text-sm leading-5 text-[#595959] [overflow-wrap:anywhere]">
              <span className="text-black">{[active.shownColor && sentenceCaseColorName(active.shownColor), active.shownStyle].filter(Boolean).join(" · ")}</span>
            </span>
          </figcaption>
        )}

        {count > 1 && (
          <>
            <div role="group" aria-label="Browse gallery" className={cn("absolute right-3 z-10 flex items-center rounded-full bg-black/70 p-1 md:right-4", active?.type === "video" ? "bottom-16" : "bottom-3 md:bottom-4")}>
            <button type="button" aria-label="Previous gallery item" disabled={activeIndex <= 0} onClick={prev} className={arrowClass}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next gallery item" disabled={activeIndex >= count - 1} onClick={next} className={arrowClass}>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            </div>
            <div className={cn("absolute left-3 right-32 z-10 md:left-4", active?.type === "video" ? "top-4" : "bottom-4")}>
              <GalleryDots labels={slides.map((slide, i) => `View ${slide.type === "video" ? "video" : "image"} ${i + 1}`)} activeIndex={activeIndex} onSelect={onSelect} />
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
            const index = e.key === "Home" ? 0 : e.key === "End" ? count - 1 : Math.max(0, Math.min(count - 1, current + (e.key === "ArrowRight" ? 1 : -1)));
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
