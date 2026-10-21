"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { useState } from "react";
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

const nav = [
  { href: "/", label: "Shop crochet" },
  { href: "/about", label: "About" },
];

const navHoverClass =
  "cursor-pointer bg-transparent text-base leading-snug transition-opacity hover:opacity-70";

function BrandName({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center whitespace-nowrap leading-[1.15] min-[800px]:flex-row min-[800px]:items-baseline min-[800px]:gap-[0.3em] min-[800px]:leading-[inherit]",
        className
      )}
    >
      <span>{SITE_NAME}</span>
      <span className="inline-flex items-baseline gap-[0.3em] text-[0.72em] min-[800px]:text-[1em]">
        <span
          aria-hidden
          className="hidden mx-[0.12em] -translate-y-[calc(0.5ex_-_0.09em)] size-[0.18em] rounded-full bg-current min-[800px]:inline-block"
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
  const { itemCount, openCheckoutDrawer } = useInquiryCart();
  const [open, setOpen] = useState(false);
  const heroHeader = pathname === "/welcome";

  if (pathname.startsWith("/maker")) {
    return null;
  }

  return (
    <>
      <header
        className={cn(
          "z-40",
          heroHeader
            ? "absolute inset-x-0 top-0"
            : "sticky top-0 bg-background"
        )}
      >
        <div className="px-[6vw] py-[3.25vw] min-[800px]:px-[4vw] min-[800px]:py-[1.5vw]">
        <div className="site-width grid grid-cols-[1fr_auto_1fr] items-center min-[800px]:flex min-[800px]:justify-between">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className={cn(
                navHoverClass,
                "-ml-3 inline-flex h-9 w-10 items-center justify-center justify-self-start min-[800px]:hidden",
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
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-sm px-3 py-3.5 text-base transition-colors",
                      isNavActive(pathname, item.href)
                        ? "bg-wash text-ink"
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
            className={cn(
              "font-display text-[length:calc(0.01*min(100vh,900px)_+_0.92rem)] leading-[1.15] tracking-[-0.04em] transition-opacity hover:opacity-70 md:text-[length:min(calc(1.05vw_+_0.95rem),34px)]",
              heroHeader ? "text-white" : "text-ink"
            )}
          >
            <BrandName />
          </Link>

          <div className="flex items-center justify-self-end gap-0.5 min-[800px]:gap-9">
          <div className="relative z-10 hidden min-[800px]:flex">
            <ThemeToggle
              lightOnDark={heroHeader}
              className={cn(navHoverClass, "h-8 w-8 opacity-85")}
            />
          </div>

          <nav
            className="hidden items-center gap-[1.3vw] min-[800px]:flex"
            aria-label="Main"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  navHoverClass,
                  heroHeader ? "text-white" : "text-ink",
                  isNavActive(pathname, item.href) ? "opacity-100" : "opacity-85"
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
                  navHoverClass,
                  "relative -mr-3 inline-flex h-9 min-w-10 items-center gap-2 px-3 text-ink opacity-85 min-[800px]:h-8"
                )}
                onClick={() => openCheckoutDrawer()}
                aria-label={`Your cart, ${itemCount} items`}
              >
                <ShoppingCart className="size-5" />
                <span className="hidden sm:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[11px] font-medium text-primary-foreground">
                    {itemCount}
                  </span>
                )}
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
