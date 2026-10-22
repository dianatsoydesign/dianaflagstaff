"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatPriceOrTbd,
  type Product,
  type StockStatus,
  type YarnColor,
} from "@/data/products";
import {
  REQUEST_DIFFERENT_SIZE_ID,
  customDimensionsWithinLimits,
  customSizeRangeMessage,
  dimensionWithinLimits,
  defaultCatalogSizeId,
  customSizeUnitPrice,
  formatCustomSizeLabel,
  isRequestDifferentSizeId,
  parseDimensionInches,
  parseLabeledCustomSize,
  type CustomSizeDimensions,
} from "@/lib/custom-size";
import { useInquiryCart } from "@/lib/inquiry-cart";
import { yarnLineName } from "@/data/yarns";
import { isSelectable, usesLiveSupplier } from "@/lib/yarn-stock";
import { QuantityPicker } from "@/components/quantity-picker";
import { SizePicker } from "@/components/size-picker";
import { PomPomPicker } from "@/components/pom-pom-picker";
import { TagPicker } from "@/components/tag-picker";
import { isCharismaCuratedPaletteYarn } from "@/data/charisma-curated-palette-yarn";
import {
  charismaHasHolidayYarns,
  charismaHolidayPizzaYarn,
  isCharismaHolidayPizzaYarn,
  type CharismaPickerGroupId,
} from "@/data/charisma-holiday-colors";
import {
  charismaHasSoftPaletteYarns,
  charismaSoftPaletteYarn,
  isCharismaSoftPaletteYarn,
} from "@/data/charisma-soft-palette";
import {
  charismaHasWarmPaletteYarns,
  charismaWarmPaletteYarn,
  isCharismaWarmPaletteYarn,
} from "@/data/charisma-warm-palette";
import { YarnSwatchPicker } from "@/components/yarn-swatch-picker";
import {
  DEFAULT_HAT_POM_POM_ID,
  getHatPomPom,
  hatPomPomPriceAdd,
  type HatPomPomId,
} from "@/lib/hat-pom-pom";
import {
  DEFAULT_PRODUCT_TAG_ID,
  getProductTag,
  type ProductTagId,
} from "@/lib/product-tags";
import { pickerSectionGapClass } from "@/components/picker-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  relatedProducts?: Product[];
  onAdded?: () => void;
  className?: string;
  /** Called whenever the selected yarn changes; used to drive the gallery. */
  onYarnChange?: (yarn: YarnColor | null, pickedByUser: boolean) => void;
  /** Called with the hovered yarn (or null when the pointer leaves the swatches). */
  onYarnPreview?: (yarn: YarnColor | null) => void;
  /** PDP header price follows size / custom dimensions. */
  onPriceChange?: (state: { unitPrice: number; priceTbd: boolean }) => void;
};

export function ProductPurchaseForm({
  product,
  relatedProducts = [],
  onAdded,
  className,
  onYarnChange,
  onYarnPreview,
  onPriceChange,
}: Props) {
  const { addItem, openAddedDrawer } = useInquiryCart();
  const [sizeId, setSizeId] = useState<string | null>(() =>
    defaultCatalogSizeId(product.sizes, product.defaultSizeId)
  );
  const [customDimensions, setCustomDimensions] = useState<CustomSizeDimensions>(
    { width: "", height: "" }
  );
  const [yarnId, setYarnId] = useState<string | null>(
    product.yarns.length === 1 ? product.yarns[0].id : null
  );
  const [tagId, setTagId] = useState<ProductTagId>(DEFAULT_PRODUCT_TAG_ID);
  const [pomPomId, setPomPomId] = useState<HatPomPomId>(DEFAULT_HAT_POM_POM_ID);
  const [liveStock, setLiveStock] = useState<Record<string, StockStatus>>({});
  const [message, setMessage] = useState<string | null>(null);
  const qtyConfig = product.quantityPicker;
  const [quantity, setQuantity] = useState(qtyConfig?.min ?? 1);

  // Keep a stable ref so the effect never needs to list onYarnChange as a dep.
  const onYarnChangeRef = useRef(onYarnChange);
  useEffect(() => {
    onYarnChangeRef.current = onYarnChange;
  });

  const customSizeSelected =
    sizeId != null && isRequestDifferentSizeId(sizeId);

  const sizedUnitPrice = useMemo(() => {
    const selectedSize = product.sizes.find((s) => s.id === sizeId);
    if (product.customSizePricing) {
      const dimensions = customSizeSelected
        ? customDimensions
        : selectedSize && !isRequestDifferentSizeId(selectedSize.id)
          ? parseLabeledCustomSize(selectedSize.label)
          : null;
      if (!dimensions) return null;
      return customSizeUnitPrice(
        dimensions,
        product.price,
        product.customSizePricing,
        customSizeSelected ? product.customSizeLimits : undefined
      );
    }
    if (
      selectedSize?.price != null &&
      !isRequestDifferentSizeId(selectedSize.id)
    ) {
      return selectedSize.price;
    }
    return null;
  }, [
    customDimensions,
    customSizeSelected,
    product.customSizeLimits,
    product.customSizePricing,
    product.price,
    product.sizes,
    sizeId,
  ]);

  const priceTbd =
    customSizeSelected &&
    (!product.customSizePricing || sizedUnitPrice === null);

  const baseUnitPrice =
    sizedUnitPrice !== null ? sizedUnitPrice : product.price;

  const pomPomAddUsd = product.showPomPomPicker
    ? hatPomPomPriceAdd(pomPomId)
    : 0;

  const unitPrice = baseUnitPrice + pomPomAddUsd;

  useEffect(() => {
    onPriceChange?.({ unitPrice, priceTbd });
  }, [unitPrice, priceTbd, onPriceChange]);

  const hasLiveStock = usesLiveSupplier(product.yarns);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/yarn-stock?productId=${product.id}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        results: { yarnId: string; status: StockStatus }[];
      };
      if (cancelled) return;
      const map: Record<string, StockStatus> = {};
      for (const r of data.results) map[r.yarnId] = r.status;
      setLiveStock(map);
      const pickDefault = () => {
        const candidates = product.defaultYarnId
          ? [
              product.yarns.find((y) => y.id === product.defaultYarnId),
              ...product.yarns,
            ]
          : product.yarns;
        return candidates.find(
          (y): y is (typeof product.yarns)[number] =>
            !!y && isSelectable(map[y.id] ?? y.stockStatus)
        );
      };
      const first = pickDefault();
      const firstId = first?.id ?? null;
      setYarnId(firstId);
      onYarnChangeRef.current?.(first ?? null, false);
    }
    void load();
    return () => { cancelled = true; };
  }, [product]); // stable: product doesn't change on this page

  const showHolidayPizza = charismaHasHolidayYarns(product.yarns);
  const showSoftPalette =
    showHolidayPizza && charismaHasSoftPaletteYarns(product.yarns);
  const showWarmPalette =
    showHolidayPizza && charismaHasWarmPaletteYarns(product.yarns);

  const yarns = useMemo(() => {
    const withStatus = product.yarns.map((y) => ({
      ...y,
      liveStatus: liveStock[y.id],
    }));
    const inStock = hasLiveStock
      ? withStatus.filter((y) => isSelectable(y.liveStatus ?? y.stockStatus))
      : withStatus;
    const extra: (YarnColor & { liveStatus?: StockStatus })[] = [];
    if (showHolidayPizza) {
      extra.push({ ...charismaHolidayPizzaYarn(), liveStatus: "in_stock" });
    }
    if (showSoftPalette) {
      extra.push({ ...charismaSoftPaletteYarn(), liveStatus: "in_stock" });
    }
    if (showWarmPalette) {
      extra.push({ ...charismaWarmPaletteYarn(), liveStatus: "in_stock" });
    }
    return extra.length ? [...inStock, ...extra] : inStock;
  }, [
    product.yarns,
    liveStock,
    hasLiveStock,
    showHolidayPizza,
    showSoftPalette,
    showWarmPalette,
  ]);

  function resolveYarn(id: string | null): YarnColor | null {
    if (!id) return null;
    if (isCharismaHolidayPizzaYarn(id)) return charismaHolidayPizzaYarn();
    if (isCharismaSoftPaletteYarn(id)) return charismaSoftPaletteYarn();
    if (isCharismaWarmPaletteYarn(id)) return charismaWarmPaletteYarn();
    return product.yarns.find((y) => y.id === id) ?? null;
  }

  function handleYarnChange(id: string) {
    setYarnId(id);
    onYarnChangeRef.current?.(resolveYarn(id), true);
  }

  function add() {
    setMessage(null);
    const customSize =
      sizeId != null && isRequestDifferentSizeId(sizeId);
    const size = customSize
      ? {
          id: REQUEST_DIFFERENT_SIZE_ID,
          label: formatCustomSizeLabel(customDimensions),
        }
      : product.sizes.find((s) => s.id === sizeId);
    const yarn = resolveYarn(yarnId);
    if (!size || !yarn) {
      setMessage("Choose a size and yarn color.");
      return;
    }
    if (customSize) {
      if (
        parseDimensionInches(customDimensions.width) === null ||
        parseDimensionInches(customDimensions.height) === null
      ) {
        setMessage("Enter valid width and height.");
        return;
      }
      if (
        product.customSizeLimits &&
        !customDimensionsWithinLimits(
          customDimensions,
          product.customSizeLimits
        )
      ) {
        setMessage(customSizeRangeMessage(product.customSizeLimits));
        return;
      }
    }
    const status = isCharismaCuratedPaletteYarn(yarn.id)
      ? "in_stock"
      : (liveStock[yarn.id] ?? yarn.stockStatus);
    if (!isSelectable(status)) { setMessage("That yarn is out of stock. Pick another color."); return; }
    const tag = getProductTag(tagId);
    const pomPom = product.showPomPomPicker
      ? getHatPomPom(pomPomId)
      : null;
    const itemId = addItem({
      kind: "catalog",
      productId: product.id,
      productName: product.name,
      sizeId: size.id,
      sizeLabel: size.label,
      yarnId: yarn.id,
      yarnName: yarn.name,
      yarnSwatchSrc: yarn.swatchSrc,
      tagId: tag.id,
      tagLabel: tag.label,
      pomPomId: pomPom?.id,
      pomPomLabel: pomPom?.label,
      productImageSrc: product.imageSrc,
      quantity: qtyConfig ? quantity : 1,
      quantityMax: qtyConfig?.max,
      unitPrice: priceTbd ? 0 : unitPrice,
      priceTbd,
    });
    openAddedDrawer(
      itemId,
      relatedProducts.map((p) => p.id)
    );
    onAdded?.();
  }

  return (
    <div className={cn("flex flex-col", pickerSectionGapClass, className)}>
      {!product.hideSizePicker && (
        <SizePicker
          sizes={product.sizes}
          value={sizeId}
          onChange={setSizeId}
          allowRequestDifferentSize={product.allowRequestDifferentSize}
          customDimensions={customDimensions}
          onCustomDimensionsChange={(next) => {
            setCustomDimensions(next);
            const limits = product.customSizeLimits;
            if (!limits) return;
            const outOfRange = (raw: string) => {
              const inches = parseDimensionInches(raw);
              return inches !== null && !dimensionWithinLimits(inches, limits);
            };
            if (!outOfRange(next.width) && !outOfRange(next.height)) {
              setMessage((current) =>
                current?.startsWith("Each side must be") ? null : current
              );
            }
          }}
          customSizeLimits={product.customSizeLimits}
        />
      )}
      {product.showPomPomPicker ? (
        <PomPomPicker value={pomPomId} onChange={setPomPomId} />
      ) : null}
      <YarnSwatchPicker
        allowHolidayFilter={product.id === "christmas-stockings"}
        keyboardNavigation
        yarns={yarns}
        value={yarnId}
        onChange={handleYarnChange}
        initialGroupFilter={
          product.defaultColorGroupFilter as CharismaPickerGroupId | undefined
        }
        onPreview={(id) => {
          if (!id || isCharismaCuratedPaletteYarn(id)) {
            onYarnPreview?.(null);
            return;
          }
          onYarnPreview?.(product.yarns.find((y) => y.id === id) ?? null);
        }}
        legend={product.yarns.map(yarnLineName).find(Boolean) ?? "Yarn color"}
      />
      <TagPicker keyboardNavigation value={tagId} onChange={setTagId} />
      {qtyConfig ? (
        <QuantityPicker
          value={quantity}
          onChange={setQuantity}
          min={qtyConfig.min ?? 1}
          max={qtyConfig.max}
          label={qtyConfig.label ?? "Quantity"}
        />
      ) : null}
      <Button
        type="button"
        className="h-12 w-full justify-between bg-button px-6 text-base text-button-foreground hover:bg-button-hover"
        onClick={add}
      >
        <span>Add to cart</span>
        <span className="tabular-nums">
          {formatPriceOrTbd(
            priceTbd,
            unitPrice * (qtyConfig ? quantity : 1)
          )}
        </span>
      </Button>
      {message && (
        <p className="text-center text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
