"use client";

import { BackButton } from "@/components/back-button";
import { useEffect, useRef } from "react";
import { NotFoundCat } from "@/components/not-found-cat";
import { Button } from "@/components/ui/button";

export function ErrorState({ retry }: { retry: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  return (
    <div className="site-gutter bg-background py-12 sm:py-20">
      <section aria-labelledby="error-heading" className="site-width flex flex-col items-center gap-10 text-center">
        <div className="w-full max-w-[600px]"><NotFoundCat /></div>
        <div className="flex w-full max-w-4xl flex-col items-center">
          <h1 ref={heading} tabIndex={-1} id="error-heading" className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.12] tracking-[-0.04em] text-ink focus:outline-none">A stitch came loose.</h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-foreground">Something went wrong. Let&apos;s try that again.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button type="button" onClick={retry} className="h-12 rounded-full bg-button px-6 text-base text-button-foreground hover:bg-button-hover">Try again</Button>
            <BackButton className="h-12 rounded-full px-6 text-base" />
          </div>
        </div>
      </section>
    </div>
  );
}
