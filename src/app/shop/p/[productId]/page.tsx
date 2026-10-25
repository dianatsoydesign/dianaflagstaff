import type { Metadata } from "next";
import { shareMetadata } from "@/lib/social-sharing";
import { notFound } from "next/navigation";
import { getProduct, listedProducts } from "@/data/products";
import { getRelatedProducts, getRandomRecommendationPool } from "@/data/product-recommendations";
import { ProductDetail } from "@/components/product-detail";

type PageProps = {
  params: Promise<{ productId: string }>;
};

export function generateStaticParams() {
  return listedProducts.map((product) => ({ productId: product.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) return {};
  return shareMetadata(product.name, `${product.name}, handmade by Diana in Flagstaff, Arizona. Explore colors and sizes. Local pickup only.`, `/shop/p/${product.id}`, `/social/${product.id}-v1.jpg`);
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();

  const related = getRelatedProducts(product.id);

  return <ProductDetail product={product} related={related} randomRecommendationPool={getRandomRecommendationPool(product.id)} />;
}
