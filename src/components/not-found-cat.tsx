"use client";

import { useEffect, useRef, useState } from "react";
import { AnimationToggle } from "@/components/animation-toggle";
import type { AnimationItem } from "lottie-web";

export function NotFoundCat({ path = "/illustrations/catplay.json", aspectRatio = "1070 / 456", animationData, active = true }: { path?: string; aspectRatio?: string; animationData?: unknown; active?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const animation = useRef<AnimationItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function reduceMotion() {
      if (preference.matches) {
        animation.current?.pause();
        setPlaying(false);
      }
    }
    preference.addEventListener("change", reduceMotion);
    void import("lottie-web").then(({ default: lottie }) => {
      if (disposed || !container.current) return;
      const player = lottie.loadAnimation({
        container: container.current, renderer: "svg", loop: true,
        autoplay: false, ...(animationData ? { animationData } : { path }),
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      animation.current = player;
      player.addEventListener("DOMLoaded", () => {
        if (disposed) return;
        setReady(true);
        if (active && !preference.matches) { player.play(); setPlaying(true); }
        else player.goToAndStop(0, true);
      });
    });
    return () => {
      disposed = true;
      preference.removeEventListener("change", reduceMotion);
      animation.current?.destroy();
      animation.current = null;
    };
  }, [path, animationData, active]);

  return (
    <div className="relative w-full">
      <div className="w-full overflow-hidden rounded-[8px]" style={{ aspectRatio }} aria-hidden="true">
        <div ref={container} className="h-full w-full" />
      </div>
      {ready && <AnimationToggle playing={playing} onClick={() => {
        if (playing) animation.current?.pause(); else animation.current?.play();
        setPlaying(!playing);
      }} />}
    </div>
  );
}
