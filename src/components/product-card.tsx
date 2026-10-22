import Image from "next/image";
import Link from "next/link";
import { ProductNamePrice } from "@/components/product-name-price";
import {
  formatProductListPrice,
  getProductListPrice,
  type Product,
} from "@/data/products";
import { productPhotoBgClass } from "@/lib/product-photo-bg";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  index?: number;
  animate?: boolean;
  zoomOnHover?: boolean;
};

export function ProductCard({
  product,
  index = 0,
  animate = false,
  zoomOnHover = false,
}: Props) {
  const imageSizes = "(max-width: 767px) 100vw, 31vw";

  return (
    <Link
      href={`/shop/p/${product.id}`}
      className={cn(
        "group flex flex-col gap-[1.5vw] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        !zoomOnHover && "soft-lift",
        animate && "fade-up",
        animate && index < 3 && `fade-up-delay-${index}`
      )}
    >
      <div
        className={cn(
          "relative aspect-square overflow-hidden rounded-[8px]",
          productPhotoBgClass
        )}
      >
        <Image
          src={product.imageSrc}
          alt={product.imageAlt}
          fill
          className={cn(
            "object-contain",
            zoomOnHover &&
              "motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out fine-pointer:motion-safe:hover:scale-[1.06]"
          )}
          sizes={imageSizes}
        />
      </div>
      <ProductNamePrice
        name={product.name}
        price={getProductListPrice(product)}
        priceLabel={formatProductListPrice(product)}
      />
    </Link>
  );
}
