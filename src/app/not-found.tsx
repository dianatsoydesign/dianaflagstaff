import type { Metadata } from "next";
import { BackButton } from "@/components/back-button";
import { NotFoundCat } from "@/components/not-found-cat";

export const metadata: Metadata = {
  title: "Page not found",
  description: "This page has wandered off. Head back to Diana's art for handmade crochet in Flagstaff.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="site-gutter bg-background py-12 sm:py-20">
      <section aria-labelledby="not-found-heading" className="site-width flex flex-col items-center gap-10 text-center">
        <div className="w-full max-w-[600px]">
          <NotFoundCat />
        </div>
        <div className="flex w-full max-w-4xl flex-col items-center">
          <h1 id="not-found-heading" className="font-display text-[clamp(2rem,4vw,3.5rem)] leading-[1.12] tracking-[-0.04em] text-ink lg:whitespace-nowrap">This page has wandered off.</h1>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-foreground">A little like a cat with a ball of yarn.</p>
          <BackButton className="mt-8 h-12 rounded-full px-6 text-base" />
        </div>
      </section>
    </div>
  );
}
