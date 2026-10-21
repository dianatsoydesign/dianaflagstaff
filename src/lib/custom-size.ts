import type { SizeOption } from "@/data/products";

/** Size chip id when the shopper requests custom dimensions (hotpads). */
export const REQUEST_DIFFERENT_SIZE_ID = "custom-request";

export function isRequestDifferentSizeId(sizeId: string): boolean {
  return sizeId === REQUEST_DIFFERENT_SIZE_ID;
}

export function sizesIncludeCustomRequest(sizes: SizeOption[]): boolean {
  return sizes.some((s) => isRequestDifferentSizeId(s.id));
}

/** Preset size to select on load; falls back to first preset, then adult-like, then first size. */
export function defaultCatalogSizeId(
  sizes: SizeOption[],
  preferredSizeId?: string
): string | null {
  if (!sizes.length) return null;
  const presets = sizes.filter((s) => !isRequestDifferentSizeId(s.id));
  if (preferredSizeId) {
    const preferred = presets.find((s) => s.id === preferredSizeId);
    if (preferred) return preferred.id;
  }
  const adultLike = presets.find(
    (s) => /adult/i.test(s.id) || /adult/i.test(s.label)
  );
  if (adultLike) return adultLike.id;
  return presets[0]?.id ?? sizes[0].id;
}

export type CustomSizeDimensions = {
  width: string;
  height: string;
};

/** Inch tick mark for displayed dimensions (chips, legend, cart). */
export const INCH_MARK = '"';

/** e.g. 7.5" × 7". Use for size labels, not form field captions. */
export function formatInchPair(
  width: string | number,
  height: string | number
): string {
  return `${width}${INCH_MARK} × ${height}${INCH_MARK}`;
}

export function formatCustomSizeLabel(
  dimensions: CustomSizeDimensions
): string {
  const w = dimensions.width.trim();
  const h = dimensions.height.trim();
  return formatInchPair(w, h);
}

/** Inches typed with at most two digits after the decimal point. */
const DIMENSION_INCHES = /^\d+(?:\.\d{1,2})?$/;

/** Keep digits and one decimal point, with at most two digits after it. */
export function sanitizeDimensionInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");
  if (dot === -1) return cleaned;
  const whole = cleaned.slice(0, dot);
  const fraction = cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);
  return `${whole}.${fraction}`;
}

export function parseDimensionInches(raw: string): number | null {
  const trimmed = raw.trim();
  if (!DIMENSION_INCHES.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Label written by the size fields, e.g. 7.25" × 8". */
export function parseLabeledCustomSize(
  label: string
): CustomSizeDimensions | null {
  const match = label
    .trim()
    .match(/^(\d+(?:\.\d{1,2})?)" × (\d+(?:\.\d{1,2})?)"$/);
  if (!match) return null;
  return { width: match[1], height: match[2] };
}

export type CustomSizePricingReference = {
  referenceWidthInches: number;
  referenceHeightInches: number;
};

/** Inclusive inch bounds for each side of a custom size. */
export type CustomSizeLimits = {
  minInches: number;
  maxInches: number;
};

export function customSizeRangeMessage(limits: CustomSizeLimits): string {
  return `Each side must be ${limits.minInches}" to ${limits.maxInches}".`;
}

export function dimensionWithinLimits(
  inches: number,
  limits: CustomSizeLimits
): boolean {
  return inches >= limits.minInches && inches <= limits.maxInches;
}

export function customDimensionsWithinLimits(
  dimensions: CustomSizeDimensions,
  limits: CustomSizeLimits
): boolean {
  const width = parseDimensionInches(dimensions.width);
  const height = parseDimensionInches(dimensions.height);
  if (width === null || height === null) return false;
  return (
    dimensionWithinLimits(width, limits) &&
    dimensionWithinLimits(height, limits)
  );
}

/** Whole-dollar price scaled by area vs the catalog default size. */
export function customSizeUnitPrice(
  dimensions: CustomSizeDimensions,
  baseUnitPrice: number,
  reference: CustomSizePricingReference,
  limits?: CustomSizeLimits
): number | null {
  const width = parseDimensionInches(dimensions.width);
  const height = parseDimensionInches(dimensions.height);
  if (width === null || height === null) return null;
  if (
    limits &&
    (!dimensionWithinLimits(width, limits) ||
      !dimensionWithinLimits(height, limits))
  ) {
    return null;
  }

  const refArea =
    reference.referenceWidthInches * reference.referenceHeightInches;
  if (refArea <= 0) return null;

  const area = width * height;
  return Math.round((baseUnitPrice * area) / refArea);
}
