"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useInquiryCart } from "@/lib/inquiry-cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { InquiryDrawer } from "@/components/inquiry-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { SITE_NAME } from "@/lib/site";
import { navigationControlClass } from "@/lib/navigation-styles";

const nav = [
  { href: "/", label: "Shop" },
  { href: "/art", label: "Art + design" },
  { href: "/about", label: "About" },
];

function BrandName({ className, inline = false }: { className?: string; inline?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center whitespace-nowrap leading-[1.15] min-[1100px]:flex-row min-[1100px]:items-baseline min-[1100px]:gap-[0.3em] min-[1100px]:leading-[inherit]",
        inline && "flex-row items-baseline gap-[0.3em]",
        className
      )}
    >
      <span>{SITE_NAME}</span>
      <span className="inline-flex items-baseline gap-[0.3em] text-[0.9em]">
        <span
          aria-hidden
          className="inline-block mx-[0.12em] -translate-y-[calc(0.5ex_-_0.09em)] size-[0.18em] rounded-full bg-current"
        />
        <span className="font-tagline font-extralight tracking-normal">Made in Flagstaff</span>
        {/* Masked so the mountains follow text color in light and dark mode. */}
        <span
          aria-hidden
          className="inline-block h-[1cap] w-[4.55cap] bg-current [mask:url(/brand/flagstaff-peaks.png)_center/contain_no-repeat]"
        />
      </span>
    </span>
  );
}

function isNavActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/shop/p/");
  }
  return pathname === href;
}

export function SiteHeader() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const shopScroll = useRef(0);
  useLayoutEffect(() => {
    const returning = pathname === "/" && previousPath.current.startsWith("/shop/p/");
    previousPath.current = pathname;
    if (pathname !== "/") return;
    let frame: number | null = null;
    if (returning) {
      const top = shopScroll.current;
      window.scrollTo({ top, behavior: "instant" });
      frame = requestAnimationFrame(() => window.scrollTo({ top, behavior: "instant" }));
    }
    const remember = () => { shopScroll.current = window.scrollY; };
    window.addEventListener("scroll", remember, { passive: true });
    return () => {
      window.removeEventListener("scroll", remember);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [pathname]);
  const { itemCount, openCheckoutDrawer } = useInquiryCart();
  const [open, setOpen] = useState(false);
  const heroHeader = pathname === "/welcome";
  const [headerHidden, setHeaderHidden] = useState(false);

  useEffect(() => {
    const smallScreen = window.matchMedia("(max-width: 1099px)");
    let previousY = window.scrollY;
    let accumulated = 0;
    const update = () => {
      const y = Math.max(0, window.scrollY);
      const delta = y - previousY;
      previousY = y;
      if (pathname !== "/art" || !smallScreen.matches || open || y < 100) {
        accumulated = 0;
        setHeaderHidden(false);
        return;
      }
      if (Math.sign(delta) !== Math.sign(accumulated)) accumulated = 0;
      accumulated += delta;
      if (accumulated > 40) setHeaderHidden(true);
      if (accumulated < -16) setHeaderHidden(false);
    };
    const reset = () => { setHeaderHidden(false); accumulated = 0; };
    reset();
    window.addEventListener("scroll", update, { passive: true });
    smallScreen.addEventListener("change", reset);
    return () => {
      window.removeEventListener("scroll", update);
      smallScreen.removeEventListener("change", reset);
    };
  }, [pathname, open]);

  if (pathname.startsWith("/maker")) {
    return null;
  }

  return (
    <>
      <header
        data-scroll-hidden={headerHidden ? "true" : "false"}
        onFocusCapture={() => setHeaderHidden(false)}
        className={cn(
          "z-40",
          headerHidden && "-translate-y-full",
          heroHeader
            ? "absolute inset-x-0 top-0"
            : pathname.startsWith("/shop/p/")
              ? "relative bg-background md:sticky md:top-0"
              : "sticky top-0 bg-background"
        )}
      >
        <div className="px-[3vw] py-[3.25vw] min-[1100px]:px-[2vw] min-[1100px]:py-[1.5vw]">
        <div className="site-width grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 items-center min-[1100px]:flex min-[1100px]:justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                navigationControlClass(heroHeader),
                "inline-flex h-11 w-11 shrink-0 items-center justify-center justify-self-start min-[1100px]:hidden",
                heroHeader ? "text-white" : "text-ink"
              )}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-display text-left text-2xl tracking-[-0.04em]">
                  <BrandName className="items-start" />
                </SheetTitle>
              </SheetHeader>
              <nav
                className="mt-6 flex flex-col gap-1 px-2"
                aria-label="Mobile"
              >
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                scroll={item.href === "/" && pathname.startsWith("/shop/p/") ? false : undefined}
                    onClick={() => setOpen(false)}
                    aria-current={isNavActive(pathname, item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-sm px-3 py-3.5 text-base transition-colors",
                      isNavActive(pathname, item.href)
                        ? "bg-wash text-ink underline decoration-2 underline-offset-8"
                        : "text-ink hover:bg-wash active:bg-wash"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 flex items-center justify-between px-3 py-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            scroll={pathname.startsWith("/shop/p/") ? false : undefined}
            className={cn(
              "min-w-0 justify-self-center text-center font-display text-[length:clamp(0.875rem,4vw,1.25rem)] leading-[1.15] tracking-[-0.04em] transition-opacity hover:opacity-70 min-[1100px]:text-[length:min(calc(1.05vw_+_0.95rem),34px)]",
              heroHeader ? "text-white" : "text-ink"
            )}
          >
            <BrandName inline />
          </Link>

          <div className="flex items-center justify-self-end gap-0.5 min-[1100px]:gap-4">
          <div className="relative z-10 hidden min-[1100px]:flex">
            <ThemeToggle
              lightOnDark={heroHeader}
            />
          </div>

          <nav
            className="hidden items-center gap-[1.3vw] min-[1100px]:flex"
            aria-label="Main"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={item.href === "/" && pathname.startsWith("/shop/p/") ? false : undefined}
                aria-current={isNavActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  navigationControlClass(heroHeader),
                  isNavActive(pathname, item.href) && "underline decoration-2 underline-offset-8"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5">
            {!heroHeader && (
              <button
                type="button"
                className={cn(
                  navigationControlClass(heroHeader),
                  "gap-2 whitespace-nowrap px-2 min-[1100px]:px-3"
                )}
                onClick={() => openCheckoutDrawer()}
                aria-label={`Your cart, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                aria-haspopup="dialog"
              >
                <span aria-hidden="true" className="relative block size-9 shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute bottom-0.5 left-0 size-7"
                  >
                    <path d="M5 5h14l1.5 16h-17L5 5Z" />
                    <path d="M8.5 9a3.5 3.5 0 0 0 7 0" />
                  </svg>
                  <span className="absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold tabular-nums leading-none text-primary-foreground ring-2 ring-background">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                </span>
                <span aria-hidden="true" className="hidden min-[1100px]:inline">Cart</span>
              </button>
            )}
          </div>
          </div>
        </div>
        </div>
      </header>

      <InquiryDrawer />
    </>
  );
}
