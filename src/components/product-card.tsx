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
  const minimum = showMinimumPurchase ? product.quantityPicker?.min ?? 1 : 1;
  const unitPrice = getProductListPrice(product);
  const imageSizes = "(max-width: 767px) 100vw, 31vw";

  return (
    <Link
      href={`/shop/p/${product.id}`}
      className={cn(
        "group flex flex-col gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
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
            dimInDark && "dark:brightness-80",
            productImageInteractionClass
          )}
          sizes={imageSizes}
        />
        <ProductImageBadge src={product.imageSrc} />
      </div>
      <ProductNamePrice
        name={product.name}
        price={unitPrice * minimum}
        priceLabel={minimum > 1 ? `${minimum} for ${formatPrice(unitPrice * minimum)}` : formatProductListPrice(product)}
      />
    </Link>
  );
}
