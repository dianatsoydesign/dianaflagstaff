"use client";

import { GalleryDots } from "@/components/gallery-dots";
import Image from "next/image";
import { productZoomInCursor, productZoomOutCursor } from "@/lib/zoom-cursor";
import { ZoomGalleryStrip } from "@/components/zoom-gallery-strip";
import { useCallback, useEffect, useEffectEvent, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Plus, RotateCcw, X } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Photo = { original: string; alt: string; width: number; height: number };
type Point = { x: number; y: number };
type View = Point & { scale: number };
const initialView: View = { scale: 1, x: 0, y: 0 };

export function ArtImageViewer({ photo, viewerLabel = "Artwork viewer", onPrevious, onNext, galleryImages, onSelectImage, returnFocusRef, showFitButton = true, showThumbnails = true, fitGalleryImages = false }: {
  showThumbnails?: boolean;
  fitGalleryImages?: boolean;
  showFitButton?: boolean;
  returnFocusRef?: React.RefObject<HTMLButtonElement | null>;
  photo: Photo;
  viewerLabel?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  galleryImages?: { src: string; alt: string }[];
  onSelectImage?: (src: string) => void;
}) {
  const pendingImageZoom = useRef(false);
  const thumbnails = useRef<HTMLDivElement>(null);
  const hasThumbnails = !!galleryImages?.length && !!onSelectImage;
  const viewport = useRef<HTMLDivElement>(null);
  const [viewportElement, setViewportElement] = useState<HTMLDivElement | null>(null);
  const attachViewport = useCallback((element: HTMLDivElement | null) => {
    viewport.current = element;
    setViewportElement(element);
  }, []);
  const spacePressed = useRef(false);
  const [handTool, setHandTool] = useState(false);
  const pointers = useRef(new Map<number, Point>());
  const previousTap = useRef<{ time: number; point: Point } | null>(null);
  const gesture = useRef<{ origin: Point; moved: boolean; multi: boolean } | null>(null);
  const currentView = useRef(initialView);
  const [view, setView] = useState(initialView);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: photo.width, height: photo.height });
  const fit = Math.min(size.width / imageSize.width, size.height / imageSize.height);
  const fittedWidth = imageSize.width * fit;
  const fittedHeight = imageSize.height * fit;

  const panLimitX = Math.max(0, (fittedWidth * view.scale - size.width) / 2);
  const panLimitY = Math.max(0, (fittedHeight * view.scale - size.height) / 2);

  function update(next: View) {
    const scale = Math.max(1, Math.min(5, next.scale));
    const limitX = Math.max(0, (fittedWidth * scale - size.width) / 2);
    const limitY = Math.max(0, (fittedHeight * scale - size.height) / 2);
    const bounded = { scale, x: Math.max(-limitX, Math.min(limitX, next.x)), y: Math.max(-limitY, Math.min(limitY, next.y)) };
    currentView.current = bounded;
    setView(bounded);
  }

  function zoom(scale: number, anchor: Point = { x: 0, y: 0 }) {
    const old = currentView.current;
    const ratio = Math.max(1, Math.min(5, scale)) / old.scale;
    update({ scale, x: anchor.x - (anchor.x - old.x) * ratio, y: anchor.y - (anchor.y - old.y) * ratio });
  }

  function localPoint(point: Point): Point {
    const rect = viewport.current!.getBoundingClientRect();
    return { x: point.x - rect.left - rect.width / 2, y: point.y - rect.top - rect.height / 2 };
  }

  useEffect(() => {
    const element = viewportElement;
    if (!element) return;
    const activePointers = pointers.current;
    const measure = () => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
      currentView.current = initialView;
      setView(initialView);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => {
      observer.disconnect();
      activePointers.clear();
    };
  }, [viewportElement]);

  useEffect(() => {
    const rail = thumbnails.current;
    const selected = rail?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!rail || !selected) return;
    const bounds = rail.getBoundingClientRect(), item = selected.getBoundingClientRect();
    if (item.top < bounds.top + 8) rail.scrollTop -= bounds.top + 8 - item.top;
    else if (item.bottom > bounds.bottom - 8) rail.scrollTop += item.bottom - bounds.bottom + 8;
    if (item.left < bounds.left + 8) rail.scrollLeft -= bounds.left + 8 - item.left;
    else if (item.right > bounds.right - 8) rail.scrollLeft += item.right - bounds.right + 8;
  }, [photo.original]);

  const touchPoints = useRef<Point[]>([]);
  const touchGesture = useRef<{ origin: Point; moved: boolean; multi: boolean } | null>(null);
  const handleTouch = useEffectEvent((event: TouchEvent) => {
    const target = event.target as HTMLElement;
    const inImageStrip = !!target.closest("[data-zoom-strip]");
    // Strip images are buttons too. Only actual controls bypass image gestures.
    if (target.closest("button") && !inImageStrip) return;
    if (currentView.current.scale <= 1 && hasThumbnails && event.touches.length < 2 && inImageStrip && !touchGesture.current?.multi) {
      // Keep one-finger native scrolling, but retain the first finger so a
      // second finger can start a pinch without losing its initial position.
      touchPoints.current = Array.from(event.touches, touch => ({ x: touch.clientX, y: touch.clientY }));
      if (event.type === "touchstart" && touchPoints.current[0]) {
        touchGesture.current = { origin: touchPoints.current[0], moved: false, multi: false };
      } else if (!event.touches.length) touchGesture.current = null;
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    if (event.cancelable) event.preventDefault();
    const next = Array.from(event.touches, touch => ({ x: touch.clientX, y: touch.clientY }));
    const before = touchPoints.current;
    if (event.type === "touchstart") {
      if (!before.length && next[0]) touchGesture.current = { origin: next[0], moved: false, multi: false };
      if (next.length > 1 && touchGesture.current) touchGesture.current.multi = true;
      setDragging(true);
    } else if (event.type === "touchmove") {
      const gesture = touchGesture.current;
      if (gesture && next[0] && Math.hypot(next[0].x - gesture.origin.x, next[0].y - gesture.origin.y) > 6) gesture.moved = true;
      const old = currentView.current;
      if (before.length === 2 && next.length === 2) {
        const distance = (points: Point[]) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        const center = (points: Point[]) => localPoint({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });
        const from = center(before), to = center(next);
        const scale = Math.max(1, Math.min(5, old.scale * distance(next) / Math.max(1, distance(before))));
        update({ scale, x: to.x - (from.x - old.x) * scale / old.scale, y: to.y - (from.y - old.y) * scale / old.scale });
      } else if (before.length === 1 && next.length === 1 && old.scale > 1) {
        update({ ...old, x: old.x + next[0].x - before[0].x, y: old.y + next[0].y - before[0].y });
      }
    } else if (!next.length) {
      const gesture = touchGesture.current;
      if (event.type === "touchend" && gesture && gesture.moved && !gesture.multi && currentView.current.scale <= 1) {
        const touch = event.changedTouches[0];
        const dx = touch.clientX - gesture.origin.x, dy = touch.clientY - gesture.origin.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
          if (dx < 0) onNext?.(); else onPrevious?.();
        }
      }
      if (event.type === "touchend" && gesture && !gesture.moved && !gesture.multi) {
        const touch = event.changedTouches[0];
        const point = { x: touch.clientX, y: touch.clientY };
        const last = previousTap.current, now = Date.now();
        if (hasThumbnails || (last && now - last.time < 350 && Math.hypot(point.x - last.point.x, point.y - last.point.y) < 30)) {
          zoom(currentView.current.scale > 1 ? 1 : 2, localPoint(point));
          previousTap.current = null;
        } else previousTap.current = { time: now, point };
      }
      touchGesture.current = null;
      setDragging(false);
    }
    touchPoints.current = next;
  });
  const handleWheel = useEffectEvent((event: WheelEvent) => {
    // Trackpad pinch is delivered as Ctrl+wheel by desktop browsers.
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      zoom(currentView.current.scale * Math.exp(-event.deltaY * 0.01), localPoint({ x: event.clientX, y: event.clientY }));
    } else if (currentView.current.scale > 1) {
      event.preventDefault();
      update({ ...currentView.current, x: currentView.current.x - (event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX) * (event.deltaMode === 1 ? 16 : 1), y: currentView.current.y - (event.shiftKey && !event.deltaX ? 0 : event.deltaY) * (event.deltaMode === 1 ? 16 : 1) });
    }
  });
  const trackpadStartScale = useRef(1);
  const handleSafariGesture = useEffectEvent((event: Event) => {
    // Safari exposes trackpad pinch through GestureEvent instead of Ctrl+wheel.
    if (touchPoints.current.length) return;
    event.preventDefault();
    const gesture = event as Event & { scale: number; clientX: number; clientY: number };
    if (event.type === "gesturestart") trackpadStartScale.current = currentView.current.scale;
    else if (event.type === "gesturechange") zoom(trackpadStartScale.current * gesture.scale, localPoint({ x: gesture.clientX, y: gesture.clientY }));
  });
  useEffect(() => {
    const element = viewportElement;
    if (!element) return;
    const safariGesture = (event: Event) => handleSafariGesture(event);
    const gestures = ["gesturestart", "gesturechange", "gestureend"];
    gestures.forEach(type => element.addEventListener(type, safariGesture, { passive: false }));
    const touch = (event: TouchEvent) => handleTouch(event);
    const wheel = (event: WheelEvent) => handleWheel(event);
    const types = ["touchstart", "touchmove", "touchend", "touchcancel"] as const;
    types.forEach(type => element.addEventListener(type, touch, { passive: false }));
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      types.forEach(type => element.removeEventListener(type, touch));
      element.removeEventListener("wheel", wheel);
      gestures.forEach(type => element.removeEventListener(type, safariGesture));
    };
  }, [viewportElement]);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("[data-zoom-strip]") || event.pointerType === "touch" || (event.button !== 0 && event.button !== 1)) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 1) gesture.current = { origin: point, moved: spacePressed.current || event.button === 1, multi: false };
    else if (gesture.current) gesture.current.multi = true;
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const oldPoint = pointers.current.get(event.pointerId);
    if (!oldPoint) return;
    event.preventDefault();
    event.stopPropagation();
    const point = { x: event.clientX, y: event.clientY };
    if (gesture.current && Math.hypot(point.x - gesture.current.origin.x, point.y - gesture.current.origin.y) > 6) gesture.current.moved = true;
    const before = [...pointers.current.values()];
    pointers.current.set(event.pointerId, point);
    const after = [...pointers.current.values()];
    const old = currentView.current;
    if (before.length === 2) {
      const distance = (points: Point[]) => Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      const middle = (points: Point[]) => localPoint({ x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 });
      const from = middle(before);
      const to = middle(after);
      const scale = Math.max(1, Math.min(5, old.scale * distance(after) / Math.max(1, distance(before))));
      const ratio = scale / old.scale;
      update({ scale, x: to.x - (from.x - old.x) * ratio, y: to.y - (from.y - old.y) * ratio });
    } else if (before.length === 1 && old.scale > 1) {
      update({ ...old, x: old.x + point.x - oldPoint.x, y: old.y + point.y - oldPoint.y });
    }
  }

  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.delete(event.pointerId);
    if (event.type === "pointerup" && gesture.current && !gesture.current.moved && !gesture.current.multi) {
      const point = { x: event.clientX, y: event.clientY };
      const last = previousTap.current;
      const now = Date.now();
      if (event.pointerType === "mouse" || (last && now - last.time < 350 && Math.hypot(point.x - last.point.x, point.y - last.point.y) < 30)) {
        zoom(currentView.current.scale > 1 ? 1 : 2, localPoint(point));
        previousTap.current = null;
      } else previousTap.current = { time: now, point };
    }
    if (!pointers.current.size) {
      gesture.current = null;
      setDragging(false);
    }
  }

  return (
    <DialogContent showCloseButton={false} finalFocus={returnFocusRef ? () => {
      returnFocusRef.current?.focus({ preventScroll: true });
      return false;
    } : undefined} onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const previous = event.key === "PageUp" || (event.key === "ArrowLeft" && currentView.current.scale <= 1);
      const next = event.key === "PageDown" || (event.key === "ArrowRight" && currentView.current.scale <= 1);
      const navigate = previous ? onPrevious : next ? onNext : undefined;
      if (navigate) { event.preventDefault(); event.stopPropagation(); navigate(); }
    }} onTouchStart={event => event.stopPropagation()} onTouchEnd={event => event.stopPropagation()} className="inset-0 left-0 top-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden border-0 bg-background p-0 ring-0 sm:max-w-none data-open:animate-none data-closed:animate-none">
      <DialogTitle className="sr-only">{viewerLabel}</DialogTitle>
      <DialogDescription className="sr-only">{photo.alt}. {hasThumbnails ? "Tap or click an image to zoom in; tap or click again to fit. Pinch to adjust zoom." : "Click the image, use the zoom buttons, pinch, or double-tap to zoom."} Two-finger scroll or drag to pan. Hold Space and drag, or use the middle mouse button, to pan. Shift+1 fits the image. {(onNext || onPrevious) && " At fit view, swipe or use left and right arrows to change images. Page Up and Page Down change images at any zoom level."} Keyboard: plus or minus to zoom, arrow keys to move, zero to fit, Escape to close.</DialogDescription>
      <div className={`absolute right-[max(0.5rem,env(safe-area-inset-right))] top-[max(0.5rem,env(safe-area-inset-top))] z-10 flex max-w-[calc(100%-1rem)] flex-wrap items-center justify-end gap-1 p-1 ${!showFitButton ? "rounded-full bg-black/[0.42] text-white" : "rounded-[8px] border border-border/50 bg-background/85 shadow-sm backdrop-blur-md"}`} role="group" aria-label="Image controls">
        {!hasThumbnails && <>
        <Button variant="ghost" size="icon" className="size-11" aria-label="Zoom out" disabled={view.scale <= 1} onClick={() => zoom(view.scale / 1.5)}><Minus aria-hidden="true" /></Button>
        <span className="min-w-12 text-center text-sm tabular-nums" role="status" aria-live="polite" aria-atomic="true">{Math.round(view.scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="size-11" aria-label="Zoom in" disabled={view.scale >= 5} onClick={() => zoom(view.scale * 1.5)}><Plus aria-hidden="true" /></Button>
        </>}
        {showFitButton && <Button variant="ghost" className="h-11 gap-2" onClick={() => update(initialView)}><RotateCcw aria-hidden="true" />Fit</Button>}
        <DialogClose render={<Button variant="ghost" size="icon" className={`size-11 ${!showFitButton ? "text-white hover:bg-transparent hover:text-white dark:hover:bg-transparent focus-visible:ring-white focus-visible:ring-inset" : ""}`} />} aria-label="Close image viewer"><X aria-hidden="true" /></DialogClose>
      </div>
      {(onPrevious || onNext) && (
        <div role="group" aria-label="Browse images" className={`absolute right-[max(0.75rem,env(safe-area-inset-right))] z-20 flex items-center rounded-full bg-black/[0.42] p-1 text-white ${hasThumbnails && showThumbnails ? "bottom-28 md:bottom-3" : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]"}`}>
          {<Button type="button" variant="ghost" size="icon" className="size-11 text-white hover:bg-transparent hover:text-white dark:hover:bg-transparent focus-visible:ring-white focus-visible:ring-inset" aria-label="Previous image" disabled={!onPrevious} onClick={onPrevious}><ArrowLeft className="size-5" aria-hidden="true" /></Button>}
          {<Button type="button" variant="ghost" size="icon" className="size-11 text-white hover:bg-transparent hover:text-white dark:hover:bg-transparent focus-visible:ring-white focus-visible:ring-inset" aria-label="Next image" disabled={!onNext} onClick={onNext}><ArrowRight className="size-5" aria-hidden="true" /></Button>}
        </div>
      )}
      {hasThumbnails && !showThumbnails && <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 right-32 z-20">
        <GalleryDots labels={galleryImages!.map((image, index) => `View image ${index + 1}: ${image.alt}`)} activeIndex={galleryImages!.findIndex(image => image.src === photo.original)} onSelect={index => onSelectImage?.(galleryImages![index].src)} />
      </div>}
      <div ref={attachViewport} tabIndex={0} role="region" aria-label={`${viewerLabel}. ${hasThumbnails ? "Tap, click, or pinch to zoom" : "Click, pinch, or double-tap to zoom"}; drag or use arrow keys to move when zoomed.`} className={`relative min-h-0 flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${hasThumbnails && showThumbnails ? "max-md:mb-24" : ""} ${hasThumbnails && view.scale === 1 ? "touch-pan-x" : "touch-none"}`} style={{ cursor: dragging ? "grabbing" : handTool ? "grab" : view.scale > 1 ? (hasThumbnails ? productZoomOutCursor : "zoom-out") : (hasThumbnails ? productZoomInCursor : "zoom-in"), marginBottom: "env(safe-area-inset-bottom)" }}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={pointerUp}
        onDoubleClick={event => event.preventDefault()}
        onContextMenu={event => event.preventDefault()}
        onDragStart={event => event.preventDefault()}
        onKeyUp={event => {
          if (event.code === "Space") { spacePressed.current = false; setHandTool(false); }
        }}
        onBlur={() => { spacePressed.current = false; setHandTool(false); }}
        onKeyDown={event => {
          if (event.target !== event.currentTarget) return;
          if (currentView.current.scale <= 1 && (event.key === "ArrowLeft" && onPrevious || event.key === "ArrowRight" && onNext)) return;
          if (event.code === "Space") {
            event.preventDefault(); spacePressed.current = true; setHandTool(true); return;
          }
          if (event.shiftKey && event.code === "Digit1") { event.preventDefault(); update(initialView); return; }
          const old = currentView.current;
          if (["+", "=", "-", "0", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault();
          if (event.key === "+" || event.key === "=") zoom(old.scale * 1.5);
          else if (event.key === "-") zoom(old.scale / 1.5);
          else if (event.key === "0") update(initialView);
          else if (event.key === "ArrowLeft") update({ ...old, x: old.x + 80 });
          else if (event.key === "ArrowRight") update({ ...old, x: old.x - 80 });
          else if (event.key === "ArrowUp") update({ ...old, y: old.y + 80 });
          else if (event.key === "ArrowDown") update({ ...old, y: old.y - 80 });
        }}>
        {hasThumbnails && <div className={`absolute inset-0 ${view.scale > 1 ? "pointer-events-none opacity-0" : ""}`} aria-hidden={view.scale > 1 || undefined}><ZoomGalleryStrip fitImages={fitGalleryImages} images={galleryImages!} selected={photo.original} onSelect={src => onSelectImage?.(src)} onZoom={src => {
          if (src === photo.original) zoom(2);
          else { pendingImageZoom.current = true; onSelectImage?.(src); }
        }} /></div>}
        <Image src={photo.original} alt={photo.alt} width={photo.width} height={photo.height} unoptimized draggable={false} onLoad={event => {
          const image = event.currentTarget;
          if (image.naturalWidth && image.naturalHeight) {
            setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
            const nextView = pendingImageZoom.current ? { scale: 2, x: 0, y: 0 } : initialView;
            pendingImageZoom.current = false;
            currentView.current = nextView;
            setView(nextView);
          }
        }} className={`pointer-events-none absolute left-1/2 top-1/2 max-w-none touch-none select-none ${hasThumbnails && view.scale === 1 ? "opacity-0" : ""}`} style={{ width: fittedWidth || "100%", height: fittedHeight || "100%", objectFit: "contain", transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.scale})` }} />
      </div>
      {hasThumbnails && showThumbnails && (
        <div ref={thumbnails} role="group" aria-label="Image thumbnails" className="absolute bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 right-2 z-20 flex gap-2 overflow-x-auto p-1 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:bottom-3 md:left-3 md:right-auto md:top-20 md:w-[72px] md:flex-col md:overflow-x-hidden md:overflow-y-auto"
          onKeyDown={event => {
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
            const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
            const current = buttons.indexOf(event.target as HTMLButtonElement);
            if (current < 0) return;
            event.preventDefault(); event.stopPropagation();
            const index = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, current + (["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : -1)));
            buttons[index]?.focus({ preventScroll: true });
            buttons[index]?.click();
          }}>
          {galleryImages!.map((image, index) => <button key={image.src} type="button" aria-label={`View image ${index + 1}: ${image.alt}`} aria-pressed={image.src === photo.original} tabIndex={image.src === photo.original ? 0 : -1} onClick={() => onSelectImage?.(image.src)} className={`relative size-16 shrink-0 overflow-hidden rounded-[8px] border-2 transition-[border-color,transform] duration-200 motion-reduce:transition-none focus-visible:outline-offset-2 ${image.src === photo.original ? "border-foreground scale-100" : "border-transparent scale-95"}`}>
            <Image src={image.src} alt="" fill unoptimized sizes="64px" className="object-contain" />
          </button>)}
        </div>
      )}
        {view.scale > 1 && (
          <div className={`absolute ${hasThumbnails ? "bottom-44 md:bottom-20" : onNext || onPrevious ? "bottom-20" : "bottom-[max(0.75rem,env(safe-area-inset-bottom))]"} right-3 z-10 flex flex-wrap rounded-[8px] border bg-background p-1 shadow-sm`} role="group" aria-label="Move around image">
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view left" disabled={view.x >= panLimitX - 0.5} onClick={() => update({ ...currentView.current, x: currentView.current.x + 80 })}><ArrowLeft aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view up" disabled={view.y >= panLimitY - 0.5} onClick={() => update({ ...currentView.current, y: currentView.current.y + 80 })}><ArrowUp aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view down" disabled={view.y <= -panLimitY + 0.5} onClick={() => update({ ...currentView.current, y: currentView.current.y - 80 })}><ArrowDown aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view right" disabled={view.x <= -panLimitX + 0.5} onClick={() => update({ ...currentView.current, x: currentView.current.x - 80 })}><ArrowRight aria-hidden="true" /></Button>
          </div>
        )}
    </DialogContent>
  );
}
