import type { Product } from "@/data/products";
import { ProductDetailClient } from "@/components/product-detail-client";

type Props = {
  product: Product;
  related: Product[];
  randomRecommendationPool?: Product[];
};

export function ProductDetail({ product, related, randomRecommendationPool }: Props) {
  return <ProductDetailClient product={product} related={related} randomRecommendationPool={randomRecommendationPool} />;
}
