"use client";

import { useEffect, useState } from "react";
import { AnimationToggle } from "@/components/animation-toggle";

export function CartCat() {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPlaying(!preference.matches);
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrame(current => (current + 1) % 20), 100);
    return () => window.clearInterval(timer);
  }, [playing]);
  return <div className="relative w-full">
    <div aria-hidden="true" className="aspect-[4/3] w-full bg-no-repeat" style={{
      backgroundImage: "url('/illustrations/cart-cat-sprite.webp')",
      backgroundSize: "500% 400%",
      backgroundPosition: `${(frame % 5) * 25}% ${Math.floor(frame / 5) * (100 / 3)}%`,
    }} />
    <AnimationToggle playing={playing} onClick={() => setPlaying(current => !current)} />
  </div>;
}
