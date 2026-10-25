import type { Metadata } from "next";
import Image from "next/image";
import { Heart, Package, PawPrint, Sprout } from "lucide-react";

const inlineAboutIcon =
  "inline size-[1.125em] shrink-0 align-[-0.15em] text-ink";

export const metadata: Metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <div className="site-gutter bg-background">
      <div className="site-width py-16">
        <div className="mx-auto flex w-full max-w-[1272px] flex-col items-center gap-10 lg:flex-row lg:items-stretch lg:justify-center lg:gap-12">
          <div className="relative aspect-square w-full max-w-[600px] shrink-0 overflow-hidden rounded-[8px] bg-muted lg:aspect-auto lg:min-h-[18rem] lg:w-full lg:max-w-[600px] lg:self-stretch">
            <Image
              src="/about/portrait-v5-mobile.jpg"
              alt="Diana smiling in a grove of yellow aspen trees"
              fill
              priority
              className="object-cover object-center lg:hidden"
              sizes="(max-width: 1023px) min(100vw, 600px), 0px"
            />
            <Image
              src="/about/portrait-v5.jpg"
              alt="Diana smiling in a grove of yellow aspen trees"
              fill
              className="hidden object-cover object-center lg:block"
              sizes="600px"
            />
          </div>
          <div className="w-full min-w-0 max-w-[600px]">
            <h1 className="font-display text-[clamp(1.75rem,2.3vw,2.3rem)] leading-[1.14] tracking-[-0.04em] text-ink">
              Greetings from Flagstaff, AZ!
            </h1>
            <div className="mt-10 space-y-6 font-sans text-lg leading-[1.8] text-ink [&_strong]:font-bold">
            <p>
              I&apos;ve been making art since I was about five, through painting,
              drawing, crochet, knitting, fashion design, photography, pottery,
              welding, and more. I graduated from{" "}
              <a
                href="https://www.pratt.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-opacity hover:opacity-70"
              >
                Pratt Institute (opens in a new tab)
              </a>{" "}
              with a Bachelor in Industrial Design and a Minor in Sustainability. I love turning ideas into something
              real you can hold, and choosing materials with the ethical and
              environmental care those studies trained me to think about.
            </p>
            <p>
              I hadn&apos;t used a crochet hook since I was twelve, until I picked
              crochet
              back up in November 2026. As a teenager I never followed
              patterns, and most of what I made were plain scarves that got
              boring fast. Patterns opened up hats, home goods, and gifts
              I&apos;m excited to share.
            </p>
            <p>
              As a vegan{" "}
              <Sprout className={inlineAboutIcon} aria-hidden />
              , I don&apos;t believe animals{" "}
              <PawPrint className={inlineAboutIcon} aria-hidden /> should be
              commodities, so I crochet with{" "}
              <strong>plant-based</strong> and <strong>synthetic</strong> yarns
              only. I promise I can always find you a great plant-based yarn
              alternative with the properties you might look for
              in wool, silk, and similar fibers.
            </p>
            <p>
              Crochet is a hobby I fit in around the rest of life, not a
              full-time job, so please lower those Amazon Prime delivery
              expectations.{" "}
              <Heart className={inlineAboutIcon} aria-hidden /> Currently, all{" "}
              <strong>pickups are&nbsp;local</strong>.{" "}
              <Package className={inlineAboutIcon} aria-hidden />
            </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
