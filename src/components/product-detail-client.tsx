"use client";

import { useEffect, useState } from "react";
import { DimensionsCircle } from "@/components/dimensions-icon";
import { MachineWashCircle } from "@/components/machine-wash-icon";
import { ProductNamePrice } from "@/components/product-name-price";
import {
  getSizeUnitPrice,
  type Product,
  type YarnColor,
} from "@/data/products";
import { defaultCatalogSizeId } from "@/lib/custom-size";
import { ProductPurchaseForm } from "@/components/product-purchase-form";
import { ProductCard } from "@/components/product-card";
import { ProductDetailGallery } from "@/components/product-detail-gallery";
import { yarnLineName, yarnMaterial } from "@/data/yarns";
import { isCharismaCuratedPaletteYarn } from "@/data/charisma-curated-palette-yarn";
import { usesLiveSupplier } from "@/lib/yarn-stock";

type Props = {
  product: Product;
  related: Product[];
};

function sentenceCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ProductDetailClient({ product, related }: Props) {
  const [selectedYarn, setSelectedYarn] = useState<YarnColor | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [previewYarn, setPreviewYarn] = useState<YarnColor | null>(null);
  const [displayUnitPrice, setDisplayUnitPrice] = useState(() => {
    const defaultSizeId = defaultCatalogSizeId(
      product.sizes,
      product.defaultSizeId
    );
    return defaultSizeId
      ? getSizeUnitPrice(product, defaultSizeId)
      : product.price;
  });
  const [priceTbd, setPriceTbd] = useState(false);

  useEffect(() => {
    const defaultSizeId = defaultCatalogSizeId(
      product.sizes,
      product.defaultSizeId
    );
    setDisplayUnitPrice(
      defaultSizeId
        ? getSizeUnitPrice(product, defaultSizeId)
        : product.price
    );
    setPriceTbd(false);
  }, [product.defaultSizeId, product.id, product.price, product.sizes]);

  const productImages = [
    { src: product.imageSrc, alt: product.imageAlt },
    ...(product.galleryImages ?? []),
  ];

  // Supplier yarns get color photos; Diana's own colorways (e.g. "Multi") are the product photos.
  const hasColorImages = (yarn: YarnColor | null): yarn is YarnColor =>
    !!yarn &&
    !isCharismaCuratedPaletteYarn(yarn.id) &&
    !!yarn.supplierSku &&
    usesLiveSupplier(product.yarns);

  const colorSrcs = (yarn: YarnColor) =>
    yarn.colorImages?.length ? yarn.colorImages : [yarn.detailSwatchSrc ?? yarn.swatchSrc];
  const productIndexOf = (src: string) => productImages.findIndex((img) => img.src === src);

  // Color photos already in the product gallery are jumped to, not appended again.
  const yarnSrcs = hasColorImages(selectedYarn)
    ? colorSrcs(selectedYarn).filter((src) => productIndexOf(src) === -1)
    : [];
  const yarnImages = yarnSrcs.map((src, i) => ({
    src,
    alt: `${selectedYarn!.name}, ${yarnLineName(selectedYarn!) ?? "yarn"}${i ? ` (${i + 1})` : ""}`,
  }));
  const slides = [...productImages, ...yarnImages];

  const previewSrc = hasColorImages(previewYarn)
    ? (previewYarn.colorImages?.[0] ?? previewYarn.detailSwatchSrc ?? previewYarn.swatchSrc)
    : null;
  const preview = previewSrc
    ? { src: previewSrc, alt: `${previewYarn!.name}, ${yarnLineName(previewYarn!) ?? "yarn"}` }
    : null;

  const materialYarn = selectedYarn ?? product.yarns[0];
  const material = materialYarn ? yarnMaterial(materialYarn) : yarnMaterial(product.yarns[0]);
  const careLineCount = material.detail ? 4 : 3;

  function handleYarnChange(yarn: YarnColor | null, pickedByUser: boolean) {
    setSelectedYarn(yarn);
    if (pickedByUser && yarn) {
      if (!hasColorImages(yarn)) setActiveIndex(0);
      else {
        const existing = productIndexOf(colorSrcs(yarn)[0]);
        setActiveIndex(existing === -1 ? productImages.length : existing);
      }
    } else setActiveIndex((i) => Math.min(i, productImages.length - 1));
  }

  return (
    <div className="site-gutter bg-background pb-20 pt-8">
      <div className="site-width">
        <div className="grid grid-cols-1 items-start gap-y-6 gap-x-[11px] md:grid-cols-2 md:gap-x-[2.75px] md:gap-y-[11px]">
          <ProductDetailGallery
            slides={slides}
            activeIndex={Math.min(activeIndex, slides.length - 1)}
            onSelect={setActiveIndex}
            preview={preview}
            className="order-3 md:order-none md:col-start-1 md:row-start-1"
          />

          <div className="contents md:col-start-2 md:row-start-1 md:flex md:flex-col md:gap-8 md:self-start md:sticky md:top-20 md:py-2 md:pl-[1vw] lg:pl-[1.5vw]">
            <ProductNamePrice
              name={product.name}
              price={displayUnitPrice}
              priceTbd={priceTbd}
              variant="detail"
              className="order-1 md:order-none"
            />
            <div className="order-2 flex flex-wrap items-start gap-x-6 gap-y-3 md:order-none">
              <div className="flex items-start gap-3">
                <MachineWashCircle lineCount={careLineCount} />
                <p className="text-sm leading-snug">
                  <span className="font-medium text-ink">{material.fiber}</span>
                  {material.detail ? (
                    <span className="block text-muted-foreground">
                      {material.detail}
                    </span>
                  ) : null}
                  <span className="block text-muted-foreground">
                    {sentenceCase(material.washCare)}
                  </span>
                  <span className="block text-muted-foreground">
                    {sentenceCase(material.dryCare)}
                  </span>
                </p>
              </div>
              {product.dimensions ? (
                <div className="flex items-start gap-3">
                  <DimensionsCircle lineCount={careLineCount} />
                  <p className="text-sm leading-snug">
                    {product.dimensions.lines.map((line, i) => (
                      <span
                        key={line}
                        className={
                          i === 0
                            ? "block font-medium text-ink"
                            : "block text-muted-foreground"
                        }
                      >
                        {sentenceCase(line)}
                      </span>
                    ))}
                  </p>
                </div>
              ) : null}
            </div>
            <ProductPurchaseForm
              product={product}
              relatedProducts={related}
              onYarnChange={handleYarnChange}
              onYarnPreview={setPreviewYarn}
              onPriceChange={({ unitPrice, priceTbd: tbd }) => {
                setDisplayUnitPrice(unitPrice);
                setPriceTbd(tbd);
              }}
              className="order-4 md:order-none"
            />
          </div>
        </div>

        {related.length > 0 && (
          <section
            className="mt-20 border-t border-border pt-16"
            aria-labelledby="related-heading"
          >
            <h2
              id="related-heading"
              className="font-display mb-10 text-[clamp(1.75rem,2.3vw,2.3rem)] tracking-[-0.04em] text-ink"
            >
              You might also like
            </h2>
            <ul className="grid grid-cols-1 gap-[11px] sm:grid-cols-2">
              {related.map((item) => (
                <li key={item.id}>
                  <ProductCard product={item} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
