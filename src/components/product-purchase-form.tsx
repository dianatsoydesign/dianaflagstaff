"use client";

import bobbinyBootstrapStock from "@/data/bobbiny-stock-bootstrap.json";
import { availableBobbiny } from "@/lib/bobbiny-inventory.mjs";
import charismaBootstrapStock from "@/data/charisma-stock-bootstrap.json";
import { charismaStockStatuses } from "@/lib/charisma-stock-options";

import { useEffect, useMemo, useRef, useState } from "react";
import bootstrapStock from "@/data/bernat-stock-bootstrap.json";
import { availableForCatCave } from "@/lib/bernat-inventory.mjs";
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
import { initialProductYarn } from "@/lib/product-color-selection";
import { useInquiryCart } from "@/lib/inquiry-cart";
import { yarnLineName } from "@/data/yarns";
import { isSelectable, usesLiveSupplier } from "@/lib/yarn-stock";
import { QuantityPicker } from "@/components/quantity-picker";
import { ProductPickupEstimate } from "@/components/product-pickup-estimate";
import { productionDaysForProduct, productsWithPickupEstimates, type PickupTiming } from "@/lib/pickup-estimate";
import { SizePicker } from "@/components/size-picker";
import { PomPomPicker } from "@/components/pom-pom-picker";
import { TagPicker } from "@/components/tag-picker";
import { isCharismaCuratedPaletteYarn } from "@/data/charisma-curated-palette-yarn";
import {
  charismaHasHolidayYarns,
  charismaHolidayPizzaYarn,
  isCharismaHolidayPizzaYarn,
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
  const [tagId, setTagId] = useState<ProductTagId>(DEFAULT_PRODUCT_TAG_ID);
  const [pomPomId, setPomPomId] = useState<HatPomPomId>(DEFAULT_HAT_POM_POM_ID);
  const isCatCave = product.id === "cat-cave";
  const isHats = product.id === "hats";
  const hasCharismaStock = isHats || product.id === "christmas-stockings";
  const hasBobbinyStock = product.yarns.some(yarn => yarn.supplierSku?.startsWith("bobbiny:"));
  const hasCachedSupplierStock = isCatCave || hasCharismaStock || hasBobbinyStock;
  const [liveStock, setLiveStock] = useState<Record<string, StockStatus>>(() =>
    isCatCave ? Object.fromEntries(product.yarns.map(yarn => [
      yarn.id,
      availableForCatCave(bootstrapStock, yarn.supplierSku?.split(":")[1] ?? "") ? "in_stock" : "out_of_stock",
    ])) : hasCharismaStock ? charismaStockStatuses(charismaBootstrapStock, isHats ? 2 : 3) : hasBobbinyStock ? Object.fromEntries(product.yarns.map(yarn => [
      yarn.id, availableBobbiny(bobbinyBootstrapStock, yarn.supplierSku?.slice("bobbiny:".length) ?? "") ? "in_stock" : "out_of_stock",
    ])) : {}
  );
  const [yarnId, setYarnId] = useState<string | null>(() =>
    initialProductYarn(product, liveStock, null, hasCachedSupplierStock)?.id ?? null
  );
  const userPickedYarn = useRef(false);
  const [stockMessage, setStockMessage] = useState("");
  const yarnIdRef = useRef(yarnId);
  useEffect(() => { yarnIdRef.current = yarnId; }, [yarnId]);
  const [message, setMessage] = useState<string | null>(null);
  const qtyConfig = product.quantityPicker;
  const [quantity, setQuantity] = useState(qtyConfig?.min ?? 1);

  // Keep a stable ref so the effect never needs to list onYarnChange as a dep.
  const onYarnChangeRef = useRef(onYarnChange);
  useEffect(() => {
    onYarnChangeRef.current = onYarnChange;
  });

  useEffect(() => {
    const requestedId = new URLSearchParams(window.location.search).get("color");
    const initial = initialProductYarn(product, liveStock, requestedId, hasCachedSupplierStock);
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      yarnIdRef.current = initial?.id ?? null;
      setYarnId(initial?.id ?? null);
      onYarnChangeRef.current?.(initial, Boolean(requestedId && initial));
    });
    return () => { cancelled = true; };
    // Initialize once on mount; stock refreshes preserve the shopper's choice below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

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
      try {
        const res = await fetch(`/api/yarn-stock?productId=${product.id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Stock unavailable");
        const data = (await res.json()) as {
          results: { yarnId: string; status: StockStatus; checkedAt?: string; message?: string }[];
        };
        if (cancelled) return;
        const map: Record<string, StockStatus> = {};
        for (const r of data.results) map[r.yarnId] = r.status;
        if (hasCachedSupplierStock) {
          if (!data.results.length || !Number.isFinite(Date.parse(data.results[0]?.checkedAt ?? ""))) {
            throw new Error("No verified stock snapshot");
          }
          setStockMessage(data.results.some(r => isSelectable(r.status)) ? "" : "No yarn colors currently have enough supplier stock.");
        }
        setLiveStock(map);
        const currentId = yarnIdRef.current;
        const currentYarn = product.yarns.find((yarn) => yarn.id === currentId);
        const currentStatus = currentId ? map[currentId] ??
          (isCharismaCuratedPaletteYarn(currentId) ? "in_stock" :
            hasCachedSupplierStock && currentYarn?.supplierSku ? "out_of_stock" :
              currentYarn?.stockStatus ?? "out_of_stock") : "out_of_stock";
        if (currentId && isSelectable(currentStatus)) return;
        const requestedId = new URLSearchParams(window.location.search).get("color");
        const next = userPickedYarn.current
          ? null
          : initialProductYarn(product, map, requestedId, hasCachedSupplierStock);
        yarnIdRef.current = next?.id ?? null;
        setYarnId(next?.id ?? null);
        onYarnChangeRef.current?.(next, Boolean(requestedId && next));
        if (currentId && !next) setMessage("That color is no longer available. Choose another color.");
      } catch {
        // Keep the last successful choices (or the initial verified snapshot).
        // A temporary stock-check outage must not empty the picker.
      }
    }
    void load();
    const timer = hasCachedSupplierStock ? window.setInterval(() => void load(), 60000) : null;
    return () => { cancelled = true; if (timer !== null) window.clearInterval(timer); };
  }, [product, hasCachedSupplierStock]); // stable: product doesn't change on this page

  const showHolidayPizza = charismaHasHolidayYarns(product.yarns);
  const showSoftPalette =
    showHolidayPizza && charismaHasSoftPaletteYarns(product.yarns);
  const showWarmPalette =
    showHolidayPizza && charismaHasWarmPaletteYarns(product.yarns);

  const yarns = (() => {
    const withStatus = product.yarns.map((y) => ({
      ...y,
      liveStatus: liveStock[y.id] ?? (hasCachedSupplierStock ? "out_of_stock" as const : undefined),
    }));
    const inStock = hasLiveStock
      ? withStatus.filter((y) => isSelectable(y.liveStatus ?? y.stockStatus))
      : withStatus;
    const extra: (YarnColor & { liveStatus?: StockStatus })[] = [];
    if (showHolidayPizza && (!hasCharismaStock || isSelectable(liveStock[charismaHolidayPizzaYarn().id] ?? "out_of_stock"))) {
      extra.push({ ...charismaHolidayPizzaYarn(), liveStatus: "in_stock" });
    }
    if (showSoftPalette && (!hasCharismaStock || isSelectable(liveStock[charismaSoftPaletteYarn().id] ?? "out_of_stock"))) {
      extra.push({ ...charismaSoftPaletteYarn(), liveStatus: "in_stock" });
    }
    if (showWarmPalette && (!hasCharismaStock || isSelectable(liveStock[charismaWarmPaletteYarn().id] ?? "out_of_stock"))) {
      extra.push({ ...charismaWarmPaletteYarn(), liveStatus: "in_stock" });
    }
    return extra.length ? [...inStock, ...extra] : inStock;
  })();

  function resolveYarn(id: string | null): YarnColor | null {
    if (!id) return null;
    if (isCharismaHolidayPizzaYarn(id)) return charismaHolidayPizzaYarn();
    if (isCharismaSoftPaletteYarn(id)) return charismaSoftPaletteYarn();
    if (isCharismaWarmPaletteYarn(id)) return charismaWarmPaletteYarn();
    return product.yarns.find((y) => y.id === id) ?? null;
  }

  const selectedTimingYarn = resolveYarn(yarnId);
  const multicolorStocking = selectedTimingYarn
    ? Boolean(selectedTimingYarn.multicolor
      || (selectedTimingYarn.sortRank ?? 0) >= 2000
      || selectedTimingYarn.id === "stockings-multi"
      || isCharismaCuratedPaletteYarn(selectedTimingYarn.id))
    : null;
  const productionDays = productionDaysForProduct({
    productId: product.id,
    quantity: qtyConfig ? quantity : 1,
    pomPomId,
    multicolor: multicolorStocking,
    customSize: customSizeSelected,
  });
  const pickupTiming: PickupTiming | null = productionDays === null ? null : {
    productionDays,
    sourcing: ["coasters", "hotpads", "placemats"].includes(product.id) ? "bobbiny" : "michaels",
  };

  function handleYarnChange(id: string) {
    userPickedYarn.current = true;
    yarnIdRef.current = id;
    setYarnId(id);
    setMessage(null);
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
      setMessage(
        !size && !yarn
          ? "Choose a size and yarn color."
          : !size
            ? "Choose a size."
            : "Choose a yarn color."
      );
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
    const status = !hasCharismaStock && isCharismaCuratedPaletteYarn(yarn.id)
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
      {hasCachedSupplierStock && stockMessage && <p role="status" className="text-sm text-muted-foreground">{stockMessage}</p>}
      <YarnSwatchPicker
        allowHolidayFilter={product.id === "christmas-stockings"}
        keyboardNavigation
        yarns={yarns}
        value={yarnId}
        onChange={handleYarnChange}
        onPreview={(id) => {
          if (!id || isCharismaCuratedPaletteYarn(id)) {
            onYarnPreview?.(null);
            return;
          }
          onYarnPreview?.(product.yarns.find((y) => y.id === id) ?? null);
        }}
        legend={product.yarns.map(yarnLineName).find(Boolean) ?? "Yarn color"}
      />
      <TagPicker
        keyboardNavigation
        value={tagId}
        onChange={setTagId}
        description={product.id === "hotpads"
          ? "Unsnap and reposition the label to use it as a hanging loop."
          : undefined}
      />
      {qtyConfig ? (
        <QuantityPicker
          value={quantity}
          onChange={setQuantity}
          min={qtyConfig.min ?? 1}
          max={qtyConfig.max}
          label={qtyConfig.label ?? "Quantity"}
        />
      ) : null}
      {productsWithPickupEstimates.has(product.id) && (
        <ProductPickupEstimate timing={pickupTiming} customSize={customSizeSelected} />
      )}
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          className="h-12 w-full justify-between bg-button px-6 text-base text-button-foreground hover:bg-button-hover"
          onClick={add}
          disabled={hasCachedSupplierStock && !yarns.length}
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
          <p className="text-left text-sm text-muted-foreground" role="status">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
