"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

/** One decorative burst lasting under five seconds, suppressed for reduced motion. */
export function ConfettiBurst({ playing }: { playing: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);
  const shouldPlay = useRef(false);
  const completed = useRef(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      shouldPlay.current = playing && !preference.matches && !completed.current;
      if (shouldPlay.current) animation.current?.play(); else animation.current?.pause();
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, [playing]);
  useEffect(() => {
    let disposed = false;
    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      const player = lottie.loadAnimation({ container: container.current, renderer: "svg", loop: false, autoplay: false, path: "/illustrations/confetti.json", rendererSettings: { preserveAspectRatio: "xMidYMid meet" } });
      player.setSpeed(1.05);
      player.addEventListener("complete", () => { completed.current = true; });
      animation.current = player;
      player.addEventListener("DOMLoaded", () => { if (!disposed && shouldPlay.current) player.play(); });
    });
    return () => { disposed = true; animation.current?.destroy(); animation.current = null; };
  }, []);
  return <div aria-hidden="true" ref={container} className="pointer-events-none absolute inset-0 motion-reduce:hidden" />;
}
