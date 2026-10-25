"use client";

import { useEffect, useRef } from "react";
import { CartCat } from "@/components/cart-cat";
import { Button } from "@/components/ui/button";

export function RequestConfirmation({ onContinue }: { onContinue: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return <div className="flex min-h-[min(50vh,20rem)] flex-col items-center justify-center px-2 py-8 text-center">
    <div className="mb-6 w-full max-w-[468px]"><CartCat celebrate /></div>
    <h3 ref={heading} tabIndex={-1} className="font-display text-3xl font-normal leading-[1.12] tracking-[-0.04em] text-ink focus:outline-none">Your request is in the bag!</h3>
    <p className="mt-4 font-sans text-lg leading-relaxed text-foreground">I’ll confirm your order within 24 hours.</p>
    <Button type="button" onClick={onContinue} className="mt-6 h-12 w-auto rounded-full bg-button px-6 text-base text-button-foreground hover:bg-button-hover">Continue shopping</Button>
  </div>;
}
