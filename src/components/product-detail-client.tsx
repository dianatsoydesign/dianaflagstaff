"use client";

import { useEffect, useRef, useState } from "react";
import { DimensionsCircle } from "@/components/dimensions-icon";
import { MachineWashCircle } from "@/components/machine-wash-icon";
import { Badge } from "@/components/ui/badge";
import { ProductNamePrice } from "@/components/product-name-price";
import {
  getSizeUnitPrice,
  type Product,
  type ProductImage,
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
  randomRecommendationPool?: Product[];
};

function sentenceCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ProductDetailClient({ product, related, randomRecommendationPool }: Props) {
  const galleryContainerRef = useRef<HTMLDivElement>(null);
  const configurationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gallery = galleryContainerRef.current?.querySelector("figure");
    const configuration = configurationRef.current;
    if (!gallery || !configuration) return;

    function updateStickyGallery() {
      if (!gallery || !configuration) return;
      const galleryHeight = gallery.getBoundingClientRect().height;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      // Preserve the full image size, and leave space to use the options below it.
      const enabled = window.innerWidth < 768 && viewportHeight - galleryHeight >= 160;
      gallery.dataset.sticky = String(enabled);
      configuration.style.setProperty("--preview-clearance", enabled ? `${galleryHeight + 16}px` : "16px");
    }

    const observer = new ResizeObserver(updateStickyGallery);
    observer.observe(gallery);
    window.addEventListener("resize", updateStickyGallery);
    window.visualViewport?.addEventListener("resize", updateStickyGallery);
    updateStickyGallery();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateStickyGallery);
      window.visualViewport?.removeEventListener("resize", updateStickyGallery);
    };
  }, [product.id]);

  useEffect(() => {
    const header = document.querySelector("header");
    const configuration = configurationRef.current;
    if (!header || !configuration) return;
    const updateOffset = () => {
      configuration.style.setProperty("--desktop-gallery-top", `${Math.ceil(header.getBoundingClientRect().height) + 16}px`);
    };
    const observer = new ResizeObserver(updateOffset);
    observer.observe(header);
    updateOffset();
    return () => observer.disconnect();
  }, []);

  const [randomRecommendations, setRandomRecommendations] = useState<Product[]>([]);
  useEffect(() => {
    const pool = [...(randomRecommendationPool ?? [])];
    // Shuffle once per page visit, keeping the chosen cards stable during interaction.
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setRandomRecommendations(pool.slice(0, 2));
  }, [product.id, randomRecommendationPool]);
  const recommendations = randomRecommendationPool?.length ? randomRecommendations : related;

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
  const minimumQuantity = product.quantityPicker?.min ?? 1;
  const [displayQuantity, setDisplayQuantity] = useState(minimumQuantity);
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
    setDisplayQuantity(minimumQuantity);
    setPriceTbd(false);
  }, [product.defaultSizeId, product.id, product.price, product.sizes, minimumQuantity]);

  const productImages = [
    { src: product.imageSrc, alt: product.imageAlt, shownColor: product.imageShownColor, shownStyle: product.imageShownStyle },
    ...(product.galleryImages ?? []),
  ];

  // Supplier yarns get color photos; Diana's own colorways (e.g. "Multi") are the product photos.
  const hasColorImages = (yarn: YarnColor | null): yarn is YarnColor =>
    !!yarn &&
    !isCharismaCuratedPaletteYarn(yarn.id) &&
    !!yarn.supplierSku &&
    (usesLiveSupplier(product.yarns) || !!yarn.colorImages?.length);

  const colorSrcs = (yarn: YarnColor) =>
    yarn.colorImages?.length ? yarn.colorImages : [yarn.detailSwatchSrc ?? yarn.swatchSrc];
  const productIndexOf = (src: string) => productImages.findIndex((img) => img.src === src);

  // Color photos already in the product gallery are jumped to, not appended again.
  const yarnSrcs = hasColorImages(selectedYarn)
    ? colorSrcs(selectedYarn).filter((src) => productIndexOf(src) === -1)
    : [];
  const yarnImages = yarnSrcs.map((src, i) => ({
    src,
    shownColor: selectedYarn!.name,
    alt: `${selectedYarn!.name}, ${yarnLineName(selectedYarn!) ?? "yarn"}${i ? ` (${i + 1})` : ""}`,
  }));
  const slides: ProductImage[] = [
    ...productImages.filter((image) => image.type !== "video"),
    ...productImages.filter((image) => image.type === "video"),
    ...yarnImages,
  ];

  const previewSrc = hasColorImages(previewYarn)
    ? (previewYarn.colorImages?.[0] ?? previewYarn.detailSwatchSrc ?? previewYarn.swatchSrc)
    : null;
  const previewProductPhoto = previewYarn ? productImages.find((image) =>
    image.type !== "video" && image.shownColor?.toLowerCase() === previewYarn.name.toLowerCase()
  ) : null;
  const preview = previewProductPhoto ?? (previewSrc
    ? { src: previewSrc, shownColor: previewYarn!.name, alt: `${previewYarn!.name}, ${yarnLineName(previewYarn!) ?? "yarn"}` }
    : null);

  const materialYarn = selectedYarn ?? product.yarns[0];
  const material = materialYarn ? yarnMaterial(materialYarn) : yarnMaterial(product.yarns[0]);
  const careLineCount = material.detail ? 4 : 3;

  function handleYarnChange(yarn: YarnColor | null, pickedByUser: boolean) {
    setSelectedYarn(yarn);
    if (pickedByUser && yarn) {
      const finishedPhoto = slides.findIndex((image) =>
        image.type !== "video" &&
        image.shownColor?.toLowerCase() === yarn.name.toLowerCase() &&
        productIndexOf(image.src) !== -1
      );
      if (finishedPhoto !== -1) setActiveIndex(finishedPhoto);
      else if (!hasColorImages(yarn)) setActiveIndex(0);
      else {
        const existing = slides.findIndex((image) => image.src === colorSrcs(yarn)[0]);
        setActiveIndex(existing === -1 ? productImages.length : existing);
      }
    } else setActiveIndex((i) => Math.min(i, productImages.length - 1));
  }

  return (
    <div className="site-gutter bg-background pb-20 pt-8">
      <div className="site-width">
        <div ref={configurationRef} className="grid grid-cols-1 items-start gap-y-6 gap-x-[11px] md:grid-cols-2 md:gap-x-[5.5px] md:gap-y-[11px] max-md:[&_button]:scroll-mt-[var(--preview-clearance,16px)] max-md:[&_input]:scroll-mt-[var(--preview-clearance,16px)]">
          <div
            ref={galleryContainerRef}
            className="max-md:contents md:col-start-1 md:row-start-1 min-w-0 md:sticky md:top-[var(--desktop-gallery-top,100px)] md:self-start"
          >
          <ProductDetailGallery
            pinOnMobile
            keyboardNavigation
            slides={slides}
            activeIndex={Math.min(activeIndex, slides.length - 1)}
            onSelect={setActiveIndex}
            preview={preview}
          />
          </div>

          <div className="contents md:col-start-2 md:row-start-1 md:flex md:flex-col md:gap-8 md:self-start md:py-2 md:pl-[2vw] lg:pl-[3vw]">
            <div className="order-1 md:order-none">
              <ProductNamePrice
                name={product.name}
                price={displayUnitPrice * displayQuantity}
                priceTbd={priceTbd}
                variant="detail"
              />
              {product.id === "cat-cave" && (
                <p className="mt-3 max-w-[700px] text-sm leading-snug text-ink">
                  <Badge className="mr-2 align-middle">New</Badge>{" "}
                  I&apos;m thrilled to take on this brand-new design!
                </p>
              )}
            </div>
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
                          product.id === "cat-cave" || i === 0
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
              onHatStyleChange={style => {
                setPreviewYarn(null);
                const label = style === "short-tip" ? "Short tip" : "Slouchy, long tip";
                const index = slides.findIndex(image => image.shownStyle === label);
                if (index !== -1) setActiveIndex(index);
              }}
              onYarnChange={handleYarnChange}
              onYarnPreview={setPreviewYarn}
              onPriceChange={({ unitPrice, priceTbd: tbd, quantity }) => {
                setDisplayUnitPrice(unitPrice);
                setDisplayQuantity(quantity);
                setPriceTbd(tbd);
              }}
              className="order-4 md:order-none"
            />
          </div>
        </div>

        {recommendations.length > 0 && (
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
            <ul className="grid grid-cols-1 gap-x-[11px] gap-y-[30px] sm:grid-cols-2 sm:gap-y-[11px]">
              {recommendations.map((item) => (
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
