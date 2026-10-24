import type { Metadata } from "next";
import Image from "next/image";
import { ProductImageBadge } from "@/components/product-image-badge";
import Link from "next/link";
import { ProductNamePrice } from "@/components/product-name-price";
import {
  formatProductListPrice,
  getProductListPrice,
  listedProducts,
} from "@/data/products";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { productImageInteractionClass } from "@/lib/product-image-styles";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Welcome",
};

const featured = listedProducts.slice(0, 3);

const landingPhotos = {
  hero: "/products/christmas-stockings/hero-studio-v6.jpg",
  shop: "/products/hats/hero-studio-sq-v2.jpg",
  about: "/products/coasters/hero.jpg",
} as const;

export default function WelcomePage() {
  return (
    <>
      <section className="relative h-[min(70vh,36rem)] min-h-72 overflow-hidden bg-neutral-200 sm:h-[36rem]">
        <Image
          src={landingPhotos.hero}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </section>

      <section className="site-gutter bg-background">
        <div className="site-width grid items-start gap-[11px] py-12 md:grid-cols-12 md:py-16">
          <h1 className="font-display text-[clamp(1.75rem,2.3vw,2.3rem)] leading-[1.14] tracking-[-0.04em] text-ink md:col-span-4">
            Handmade pieces for cold mornings.
          </h1>
          <ul className="grid grid-cols-1 gap-[11px] sm:grid-cols-3 md:col-span-8">
            {featured.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/shop/p/${product.id}`}
                  className="flex flex-col gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <div className={cn("relative aspect-[3/4] overflow-hidden", productPhotoBgClass)}>
                    <Image
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      fill
                      className={cn("object-contain", productImageInteractionClass)}
                      sizes="(max-width: 640px) 100vw, 22vw"
                    />
                    <ProductImageBadge src={product.imageSrc} />
                  </div>
                  <ProductNamePrice
                    name={product.name}
                    price={getProductListPrice(product)}
                    priceLabel={formatProductListPrice(product)}
                    variant="featured"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="site-gutter bg-background pb-16">
        <div className="site-width grid grid-cols-1 gap-[11px] md:grid-cols-2">
          <Link href="/" className="group relative block aspect-square overflow-hidden">
            <Image
              src={landingPhotos.shop}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 46vw"
            />
            <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/30" />
            <span className="absolute left-10 top-8 font-sans text-[1.32rem] font-bold text-white">
              Crochet shop
            </span>
            <span className="absolute bottom-10 left-10 font-display text-[clamp(1.75rem,2.3vw,2.3rem)] tracking-[-0.04em] text-white">
              Seasonal makes
            </span>
          </Link>
          <Link href="/about" className="group relative block aspect-square overflow-hidden">
            <Image
              src={landingPhotos.about}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 46vw"
            />
            <div className="absolute inset-0 bg-black/15 transition-colors group-hover:bg-black/30" />
            <span className="absolute left-10 top-8 font-sans text-[1.32rem] font-bold text-white">
              About
            </span>
            <span className="absolute bottom-10 left-10 font-display text-[clamp(1.75rem,2.3vw,2.3rem)] tracking-[-0.04em] text-white">
              Diana
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
