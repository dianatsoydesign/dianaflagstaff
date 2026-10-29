"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Plus, RotateCcw, X } from "lucide-react";
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Photo = { original: string; alt: string; width: number; height: number };
type Point = { x: number; y: number };
type View = Point & { scale: number };
const initialView: View = { scale: 1, x: 0, y: 0 };

export function ArtImageViewer({ photo }: { photo: Photo }) {
  const viewport = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, Point>());
  const previousTap = useRef<{ time: number; point: Point } | null>(null);
  const gesture = useRef<{ origin: Point; moved: boolean; multi: boolean } | null>(null);
  const currentView = useRef(initialView);
  const [view, setView] = useState(initialView);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const fit = Math.min(size.width / photo.width, size.height / photo.height);
  const fittedWidth = photo.width * fit;
  const fittedHeight = photo.height * fit;

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
    const element = viewport.current;
    if (!element) return;
    const measure = () => {
      setSize({ width: element.clientWidth, height: element.clientHeight });
      currentView.current = initialView;
      setView(initialView);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, point);
    if (pointers.current.size === 1) gesture.current = { origin: point, moved: false, multi: false };
    else if (gesture.current) gesture.current.multi = true;
  }

  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const oldPoint = pointers.current.get(event.pointerId);
    if (!oldPoint) return;
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
      if (last && now - last.time < 350 && Math.hypot(point.x - last.point.x, point.y - last.point.y) < 30) {
        zoom(currentView.current.scale > 1 ? 1 : 2.5, localPoint(point));
        previousTap.current = null;
      } else previousTap.current = { time: now, point };
    }
    if (!pointers.current.size) gesture.current = null;
  }

  return (
    <DialogContent showCloseButton={false} className="inset-0 left-0 top-0 flex h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 bg-background p-0 ring-0 sm:max-w-none data-open:animate-none data-closed:animate-none">
      <DialogTitle className="sr-only">Artwork viewer</DialogTitle>
      <DialogDescription className="sr-only">{photo.alt}. Use the zoom buttons, pinch, or double-tap to zoom. Drag to move a zoomed image. Keyboard: plus or minus to zoom, arrow keys to move, zero to fit, Escape to close.</DialogDescription>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 border-b bg-background px-2 pb-1 pt-[max(0.25rem,env(safe-area-inset-top))] pr-[max(0.5rem,env(safe-area-inset-right))]" role="group" aria-label="Image controls">
        <Button variant="ghost" size="icon" className="size-11" aria-label="Zoom out" disabled={view.scale <= 1} onClick={() => zoom(view.scale / 1.5)}><Minus aria-hidden="true" /></Button>
        <span className="min-w-12 text-center text-sm tabular-nums" role="status" aria-live="polite" aria-atomic="true">{Math.round(view.scale * 100)}%</span>
        <Button variant="ghost" size="icon" className="size-11" aria-label="Zoom in" disabled={view.scale >= 5} onClick={() => zoom(view.scale * 1.5)}><Plus aria-hidden="true" /></Button>
        <Button variant="ghost" className="h-11 gap-2" onClick={() => update(initialView)}><RotateCcw aria-hidden="true" />Fit</Button>
        <DialogClose render={<Button variant="ghost" size="icon" className="size-11" />} aria-label="Close image viewer"><X aria-hidden="true" /></DialogClose>
      </div>
      <div ref={viewport} tabIndex={0} role="region" aria-label="Artwork. Pinch or double-tap to zoom; drag or use arrow keys to move when zoomed." className="relative min-h-0 flex-1 touch-none overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring" style={{ cursor: view.scale > 1 ? "grab" : "zoom-in", marginBottom: "env(safe-area-inset-bottom)" }}
        onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onLostPointerCapture={pointerUp}
        onDoubleClick={event => event.preventDefault()}
        onKeyDown={event => {
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
        <Image src={photo.original} alt={photo.alt} width={photo.width} height={photo.height} unoptimized draggable={false} className="absolute left-1/2 top-1/2 max-w-none select-none" style={{ width: fittedWidth || "100%", height: fittedHeight || "100%", objectFit: "contain", transform: `translate(-50%, -50%) translate(${view.x}px, ${view.y}px) scale(${view.scale})` }} />
        {view.scale > 1 && (
          <div className="absolute bottom-3 right-3 flex flex-wrap rounded-[8px] border bg-background p-1 shadow-sm" role="group" aria-label="Move around image" onPointerDown={event => event.stopPropagation()} onPointerUp={event => event.stopPropagation()}>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view left" onClick={() => update({ ...currentView.current, x: currentView.current.x + 80 })}><ArrowLeft aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view up" onClick={() => update({ ...currentView.current, y: currentView.current.y + 80 })}><ArrowUp aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view down" onClick={() => update({ ...currentView.current, y: currentView.current.y - 80 })}><ArrowDown aria-hidden="true" /></Button>
            <Button variant="ghost" size="icon" className="size-11" aria-label="Move view right" onClick={() => update({ ...currentView.current, x: currentView.current.x - 80 })}><ArrowRight aria-hidden="true" /></Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
