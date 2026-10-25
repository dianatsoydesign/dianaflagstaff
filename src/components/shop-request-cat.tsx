"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

/** A single decorative entrance, never replayed on hover or scroll. */
export function ShopRequestCat() {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let disposed = false;
    let ready = false;
    let visible = false;
    let started = false;
    let player: AnimationItem | undefined;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function playOnce() {
      if (!ready || !visible || started || !player) return;
      started = true;
      observer.disconnect();
      if (!preference.matches) player.play();
    }
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      playOnce();
    }, { threshold: 0.4 });
    observer.observe(element);
    function reduceMotion() {
      if (preference.matches) { player?.pause(); started = true; observer.disconnect(); }
    }
    preference.addEventListener("change", reduceMotion);
    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed) return;
      player = lottie.loadAnimation({ container: element, renderer: "svg", loop: false, autoplay: false, path: "/illustrations/playing-cat.json", rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
      player.addEventListener("DOMLoaded", () => { ready = true; playOnce(); });
    });
    return () => {
      disposed = true;
      observer.disconnect();
      preference.removeEventListener("change", reduceMotion);
      player?.destroy();
    };
  }, []);
  return <div ref={container} aria-hidden="true" className="pointer-events-none aspect-square w-full" />;
}
