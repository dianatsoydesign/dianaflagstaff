"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductImageBadge } from "@/components/product-image-badge";
import { ProductNamePrice } from "@/components/product-name-price";
import {
  formatProductListPrice,
  formatPrice,
  getProductListPrice,
  type Product,
} from "@/data/products";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { productImageInteractionClass } from "@/lib/product-image-styles";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  index?: number;
  animate?: boolean;
  dimInDark?: boolean;
  showMinimumPurchase?: boolean;
};

export function ProductCard({
  product,
  index = 0,
  animate = false,
  dimInDark = false,
  showMinimumPurchase = false,
}: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const instructions = useId();
  const images = [{ src: product.imageSrc, alt: product.imageAlt }, ...(product.galleryImages ?? []).filter(image => image.type !== "video")];
  const minimum = showMinimumPurchase ? product.quantityPicker?.min ?? 1 : 1;
  const unitPrice = getProductListPrice(product);
  const imageSizes = "(max-width: 767px) 100vw, 31vw";

  return (
    <div
      className={cn(
        "group flex flex-col gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        animate && "fade-up",
        animate && index < 3 && `fade-up-delay-${index}`
      )}
    >
      <div className={cn("relative aspect-square overflow-hidden rounded-[8px]", productPhotoBgClass)}>
        <p id={instructions} className="sr-only">Swipe or scroll horizontally to browse {product.name} photos. Use left and right arrow keys when a photo is focused. Select a photo to view the product.</p>
        <div ref={rail} role="group" aria-label={`${product.name} photos`} aria-describedby={instructions}
          className="absolute inset-0 flex snap-x snap-mandatory gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={event => {
            const element = event.currentTarget;
            setActiveImage(Math.max(0, Math.min(images.length - 1, Math.round(element.scrollLeft / (element.clientWidth + 4)))));
          }}
          onPointerDown={event => { pointerStart.current = { x: event.clientX, y: event.clientY }; swiped.current = false; }}
          onPointerMove={event => { const start = pointerStart.current; if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) swiped.current = true; }}
          onPointerUp={() => { pointerStart.current = null; }}
          onPointerCancel={() => { pointerStart.current = null; swiped.current = true; }}
          onKeyDown={event => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key) || event.altKey || event.metaKey || event.ctrlKey) return;
            const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
            const current = links.indexOf(event.target as HTMLAnchorElement);
            if (current < 0) return;
            event.preventDefault();
            const next = event.key === "Home" ? 0 : event.key === "End" ? links.length - 1 : Math.max(0, Math.min(links.length - 1, current + (event.key === "ArrowRight" ? 1 : -1)));
            links[next]?.focus({ preventScroll: true });
            rail.current?.scrollTo({ left: links[next].offsetLeft, behavior: "instant" });
          }}>
          {images.map((image, imageIndex) => <Link key={image.src} href={`/shop/p/${product.id}`} aria-label={`View ${product.name}, photo ${imageIndex + 1} of ${images.length}: ${image.alt}`}
            onClick={event => { if (swiped.current && event.detail !== 0) event.preventDefault(); }}
            className="relative block h-full w-full shrink-0 snap-start overflow-hidden focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground">
            <Image src={image.src} alt={image.alt} fill className={cn("object-contain", dimInDark && "dark:brightness-80", productImageInteractionClass)} sizes={imageSizes} loading="lazy" />
            <ProductImageBadge src={image.src} />
          </Link>)}
        </div>
        {images.length > 1 && <div role="group" aria-label={`${product.name} photo navigation`} className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] flex-wrap rounded-full bg-black/[0.42] px-1">
          {images.map((image, imageIndex) => <button key={image.src} type="button" aria-label={`View ${product.name} photo ${imageIndex + 1}`} aria-current={activeImage === imageIndex ? "true" : undefined}
            onClick={() => {
              const element = rail.current;
              const slide = element?.children[imageIndex] as HTMLElement | undefined;
              if (element && slide) element.scrollTo({ left: slide.offsetLeft, behavior: "instant" });
            }}
            className="inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white">
            <span aria-hidden="true" className={cn("h-2 rounded-full transition-all motion-reduce:transition-none", activeImage === imageIndex ? "w-4 bg-white" : "w-2 bg-white")} />
          </button>)}
        </div>}
      </div>
      <Link href={`/shop/p/${product.id}`} className="rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
      <ProductNamePrice
        name={product.name}
        price={unitPrice * minimum}
        priceLabel={minimum > 1 ? `${minimum} for ${formatPrice(unitPrice * minimum)}` : formatProductListPrice(product)}
      />
      </Link>
    </div>
  );
}
