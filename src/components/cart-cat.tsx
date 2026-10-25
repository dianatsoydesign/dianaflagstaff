"use client";

import { useEffect, useRef, useState } from "react";
import { ConfettiBurst } from "@/components/confetti-burst";
import { AnimationToggle } from "@/components/animation-toggle";

export function CartCat({ celebrate = false }: { celebrate?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState(0);
  const currentFrame = useRef(0);
  const completed = useRef(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPlaying(!preference.matches && !completed.current);
    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (celebrate && currentFrame.current === 18) {
        completed.current = true;
        setPlaying(false);
        window.clearInterval(timer);
        return;
      }
      currentFrame.current = (currentFrame.current + 1) % 20;
      setFrame(currentFrame.current);
    }, 100);
    return () => window.clearInterval(timer);
  }, [playing, celebrate]);
  return <div className="relative w-full">
    <div aria-hidden="true" className="aspect-[4/3] w-full bg-no-repeat" style={{
      backgroundImage: "url('/illustrations/cart-cat-sprite-v2.webp')",
      backgroundSize: "500% 400%",
      backgroundPosition: `${(frame % 5) * 25}% ${Math.floor(frame / 5) * (100 / 3)}%`,
    }} />
    {celebrate && <ConfettiBurst playing />}
    {!celebrate && <AnimationToggle playing={playing} onClick={() => setPlaying(current => !current)} />}
  </div>;
}
