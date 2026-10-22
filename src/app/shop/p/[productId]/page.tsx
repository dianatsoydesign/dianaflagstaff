import type { Metadata } from "next";
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
  return { title: product.name };
}

export default async function ProductPage({ params }: PageProps) {
  const { productId } = await params;
  const product = getProduct(productId);
  if (!product) notFound();

  const related = getRelatedProducts(product.id);

  return <ProductDetail product={product} related={related} randomRecommendationPool={getRandomRecommendationPool(product.id)} />;
}
