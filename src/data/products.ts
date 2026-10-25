import { BOBBINY_PREMIUM_5MM_YARNS } from "@/data/bobbiny-premium-5mm";
import { BERNAT_BLANKET_BIG_YARNS } from "@/data/bernat-blanket-big";
import { CHARISMA_YARNS } from "@/data/charisma";
import type { GalleryMatteInset } from "@/lib/gallery-matte-inset";

export type { GalleryMatteInset };

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type YarnColor = {
  id: string;
  name: string;
  /** Path to yarn swatch image. Swap these files for Diana's real yarn photos */
  swatchSrc: string;
  /** Larger texture/detail shot (e.g. Bobbiny PDP image 2) */
  detailSwatchSrc?: string;
  /** Color-focused gallery shots, best first: close-up, whole spool, then other color shots */
  colorImages?: string[];
  /** Optional supplier SKU used by the stock adapter */
  supplierSku?: string;
  stockStatus: StockStatus;
  /** Charisma: from swatch pixels at sync (lower = earlier in picker). */
  sortRank?: number;
  /** Charisma: variegated / multi-tone swatch (always sorted last). */
  multicolor?: boolean;
  /** Charisma: swatch-pixel family for picker chips (see charisma-swatch-sort.mjs). */
  colorGroup?: string;
};

export type SizeOption = {
  id: string;
  label: string;
  /** Overrides `product.price` for this size on the PDP and in the cart. */
  price?: number;
};

export type ProductImage = {
  type?: "image" | "video";
  poster?: string;
  src: string;
  alt: string;
  /** Product color shown in this photo, displayed beneath the PDP image. */
  shownColor?: string;
  /** Hide studio matte (fractions of image size); content is scaled with `object-contain`. */
  galleryMatteInset?: GalleryMatteInset;
};

export type QuantityPickerConfig = {
  min?: number;
  max: number;
  label?: string;
};

/** Fixed size copy beside the dimensions icon on the PDP (not in the cart). */
export type ProductDimensions = {
  lines: string[];
};

export type Product = {
  id: string;
  /** Shows the New badge and places this product ahead of established products in the shop. */
  isNew?: boolean;
  name: string;
  price: number;
  category: string;
  imageSrc: string;
  imageAlt: string;
  /** Color(s) pictured in the main PDP photo. */
  imageShownColor?: string;
  /** Additional gallery images (not including imageSrc which is always first). */
  galleryImages?: ProductImage[];
  sizes: SizeOption[];
  /** Initial size chip on the PDP (must match a preset `sizes[].id`). */
  defaultSizeId?: string;
  /** Hide size UI when there is nothing meaningful to choose (still uses sizes[0] for orders). */
  hideSizePicker?: boolean;
  /** Extra chip after preset sizes to enter custom dimensions (hotpads). */
  allowRequestDifferentSize?: boolean;
  /** Scale `price` by area vs this reference size (dimension chips and custom). */
  customSizePricing?: {
    referenceWidthInches: number;
    referenceHeightInches: number;
  };
  /** Inclusive inch bounds for each side when requesting a different size. */
  customSizeLimits?: {
    minInches: number;
    maxInches: number;
  };
  /** Product-page quantity stepper (+ / −), e.g. coasters up to 12 sets. */
  quantityPicker?: QuantityPickerConfig;
  /** Color pictured in the main photo; selected on load only when available. */
  defaultYarnId?: string;
  /** Charisma picker: initial family chip (e.g. `holiday`). */
  defaultColorGroupFilter?: string;
  /** Hidden from shop, PDP, and links until ready to sell. */
  hidden?: boolean;
  /** Pom pom style chips (hats). */
  showPomPomPicker?: boolean;
  /** Shown next to machine wash (e.g. coasters 4.5" × 4.5"). */
  dimensions?: ProductDimensions;
  yarns: YarnColor[];
};

export const VENMO_HANDLE = "@diana-flagstaff";

/** No longer on a catalog product, but still offered on the "Request a make" board. */
export const PATTERN_BOARD_YARNS: YarnColor[] = [
  {
    id: "oat-cream",
    name: "Oat Cream",
    swatchSrc: "/yarn-swatches/oat-cream.svg",
    supplierSku: "LL-YH-02",
    stockStatus: "in_stock",
  },
  {
    id: "forest-heather",
    name: "Forest Heather",
    swatchSrc: "/yarn-swatches/forest-heather.svg",
    supplierSku: "LL-YH-01",
    stockStatus: "in_stock",
  },
  {
    id: "cranberry-dusk",
    name: "Cranberry Dusk",
    swatchSrc: "/yarn-swatches/cranberry-dusk.svg",
    supplierSku: "LL-YH-04",
    stockStatus: "in_stock",
  },
  {
    id: "pine-needle",
    name: "Pine Needle",
    swatchSrc: "/yarn-swatches/pine-needle.svg",
    supplierSku: "LL-YH-05",
    stockStatus: "in_stock",
  },
  {
    id: "holly-red",
    name: "Holly Red",
    swatchSrc: "/yarn-swatches/holly-red.svg",
    supplierSku: "LL-YH-06",
    stockStatus: "in_stock",
  },
];

export const products: Product[] = [
  {
    id: "christmas-stockings",
    name: "Christmas stockings",
    price: 35,
    category: "Holiday",
    imageSrc: "/products/christmas-stockings/hero-studio-v9.jpg",
    imageAlt: "Row of handmade crochet Christmas stockings in holiday colors",
    imageShownColor: "Multi, Red, Off White, Pine, Multi (left to right)",
    galleryImages: [
      { src: "/products/christmas-stockings/2-studio-v2.jpg", alt: "Red crochet Christmas stocking with ribbed cuff and tassel", shownColor: "Red" },
      { src: "/products/christmas-stockings/off-white-studio-v2.jpg", alt: "Cream crochet Christmas stocking with ribbed cuff and tassel", shownColor: "Off White" },
      { src: "/products/christmas-stockings/pine-studio-v3.jpg", alt: "Pine green crochet Christmas stocking with ribbed cuff and tassel", shownColor: "Pine" },
      { src: "/products/christmas-stockings/4-studio-v4.jpg", alt: "Hand holding a striped crochet Christmas stocking", shownColor: "Multi" },
    ],
    sizes: [{ id: "one", label: "One stocking" }],
    hideSizePicker: true,
    defaultColorGroupFilter: "holiday",
    yarns: [
      ...CHARISMA_YARNS,
      {
        id: "stockings-multi",
        name: "Multi",
        swatchSrc: "/yarn-swatches/stockings-multi-photo4.webp",
        stockStatus: "in_stock",
      },
    ],
  },
  {
    id: "coasters",
    name: "Coasters",
    price: 5,
    category: "Table",
    imageSrc: "/products/coasters/2-studio-v9.jpg",
    imageAlt: "Eucalyptus green crochet coaster held between fingers",
    imageShownColor: "Eucalyptus Green",
    defaultYarnId: "bobbiny-5mm-eucalyptus-green",
    galleryImages: [
      { src: "/products/coasters/hero-studio-v6.jpg", alt: "Hand holding a stack of eucalyptus green handmade crochet coasters", shownColor: "Eucalyptus Green" },
      { src: "/products/coasters/mug-studio-v5.jpg", alt: "Close-up of a eucalyptus green crochet coaster with a black mug and by Diana label tag", shownColor: "Eucalyptus Green" },
    ],
    sizes: [{ id: "one", label: "One coaster" }],
    hideSizePicker: true,
    dimensions: {
      lines: ['4.5" × 4.5"'],
    },
    quantityPicker: { max: 12 },
    yarns: BOBBINY_PREMIUM_5MM_YARNS,
  },
  {
    id: "placemats",
    name: "Placemats",
    price: 20,
    category: "Table",
    imageSrc: "/products/placemats/placemats-image-1-studio-v2.jpg",
    imageAlt: "Stack of golden natural crochet placemats with fine gold fibers",
    imageShownColor: "Golden Natural",
    galleryImages: [
      { src: "/products/placemats/placemats-image-3-studio-v1.jpg", alt: "Golden natural crochet placemat with a ceramic plate, fork, and spoon", shownColor: "Golden Natural" },
      { type: "video", src: "/products/placemats/placemats-deflicker-v1.mp4", alt: "Placemats product video", shownColor: "Golden Natural", poster: "/products/placemats/placemats-image-1-studio-v2.jpg" },
    ],
    sizes: [{ id: "one", label: "One placemat" }],
    hideSizePicker: true,
    dimensions: {
      lines: ['16" × 10"'],
    },
    quantityPicker: { max: 12 },
    defaultYarnId: "bobbiny-5mm-golden-natural",
    yarns: BOBBINY_PREMIUM_5MM_YARNS,
  },
  {
    id: "elf-hat",
    name: "Elf hat",
    price: 45,
    category: "Holiday",
    imageSrc: "/products/elf-hat/hero-studio-v6.jpg",
    imageAlt: "Handmade red and white striped crochet elf hat with green brim",
    sizes: [
      { id: "baby", label: "Baby", price: 28 },
      { id: "toddler", label: "Toddler", price: 32 },
      { id: "child", label: "Child", price: 36 },
      { id: "adult", label: "Adult", price: 45 },
    ],
    defaultSizeId: "adult",
    yarns: [
      {
        id: "elf-hat-multi",
        name: "Holiday",
        swatchSrc: "/yarn-swatches/elf-hat-multi.webp",
        stockStatus: "in_stock",
      },
    ],
  },
  {
    id: "mushroom-hat",
    name: "Mushroom hat",
    price: 55,
    category: "Holiday",
    imageSrc: "/products/mushroom hat/mushroom-hat-1-ai-upscaled-2048-v1.jpg",
    imageAlt: "Man wearing a red crochet mushroom hat with white spots and brim",
    galleryImages: [
      { src: "/products/mushroom hat/mushroom-hat-2-ai-upscaled-2048-v1.jpg", alt: "Side view of a red crochet mushroom hat with white spots and a leather tag" },
      { src: "/products/mushroom hat/mushroom-hat-3-ai-upscaled-2048-v1.jpg", alt: "Woman wearing a red crochet mushroom hat with white spots and brim" },
    ],
    sizes: [
      { id: "baby", label: "Baby", price: 34 },
      { id: "toddler", label: "Toddler", price: 39 },
      { id: "child", label: "Child", price: 44 },
      { id: "adult", label: "Adult", price: 55 },
    ],
    defaultSizeId: "adult",
    yarns: [
      {
        id: "mushroom-hat-multi",
        name: "Red and white",
        swatchSrc: "/yarn-swatches/mushroom-hat-multi.svg",
        stockStatus: "in_stock",
      },
    ],
  },
  {
    id: "hotpads",
    name: "Hotpads",
    price: 12,
    category: "Kitchen",
    imageSrc: "/products/hotpads/hero-studio-v3.jpg",
    imageAlt: "Stack of terracotta handmade crochet hot pads",
    imageShownColor: "Terracotta",
    defaultYarnId: "bobbiny-5mm-terracotta",
    galleryImages: [
      { src: "/products/hotpads/3-studio-v10.jpg", alt: "Hand fanning out terracotta crochet hot pads", shownColor: "Terracotta" },
      { src: "/products/hotpads/4-studio-v2.jpg", alt: "Side view of stacked terracotta crochet hot pads", shownColor: "Terracotta" },
      { src: "/products/hotpads/label-uses-closeup-v1.jpg", alt: "Close-up comparison of warm beige hotpads with removable leather labels wrapped around the edge and used as a hanging loop", shownColor: "Warm Beige" },
      { src: "/products/hotpads/hotpad-with-product-1-studio-v1.jpg", alt: "Warm beige crochet hotpad with a glass candle", shownColor: "Warm Beige" },
      { src: "/products/hotpads/hotpad-with-product-2-studio-v1.jpg", alt: "Warm beige crochet hotpad under a stainless steel saucepan", shownColor: "Warm Beige" },
      { src: "/products/hotpads/hotpad-with-product-3-studio-v2.jpg", alt: "Warm beige crochet hotpad hanging by its leather loop on a wall hook", shownColor: "Warm Beige" },
    ],
    sizes: [
      { id: "one", label: '7.5" × 7"' },
      { id: "8.5x8", label: '8.5" × 8"' },
      { id: "10x9", label: '10" × 9"' },
    ],
    allowRequestDifferentSize: true,
    customSizePricing: {
      referenceWidthInches: 7.5,
      referenceHeightInches: 7,
    },
    customSizeLimits: { minInches: 7, maxInches: 10 },
    quantityPicker: { max: 10 },
    yarns: BOBBINY_PREMIUM_5MM_YARNS,
  },
  {
    id: "cat-cave",
    isNew: true,
    name: "Cat or small dog cave",
    price: 50,
    category: "Pets",
    imageSrc: "/products/cat cave/cat-cave-with-cat-studio-v1.jpg",
    imageAlt: "Tortoiseshell cat inside a plush Toasted Birch crochet cat cave beside a potted plant",
    imageShownColor: "Toasted Birch",
    sizes: [{ id: "one", label: "One size" }],
    hideSizePicker: true,
    dimensions: { lines: ['20" overall diameter', '8" opening diameter'] },
    defaultYarnId: "bernat-blanket-big-toasted-birch",
    yarns: BERNAT_BLANKET_BIG_YARNS,
  },
  {
    id: "wine-bottle-holders",
    name: "Wine bottle holders",
    price: 32,
    category: "Home",
    hidden: true,
    imageSrc: "/products/wine-bottle-holders/hero-studio-v2.jpg",
    imageAlt: "Two handmade crochet wine bottle holders in cream and burgundy",
    galleryImages: [
      { src: "/products/wine-bottle-holders/2-studio-v2.jpg", alt: "Crochet wine bottle holder close-up" },
    ],
    sizes: [{ id: "one", label: "One holder" }],
    yarns: BOBBINY_PREMIUM_5MM_YARNS,
  },
  {
    id: "hats",
    name: "Hats",
    price: 25,
    category: "Hats",
    imageSrc: "/products/hats/hero-studio-sq-v2.jpg",
    imageAlt: "Two handmade pom-pom beanies in rust and speckled charcoal yarn",
    galleryImages: [
      { src: "/products/hats/2-studio-sq-v3.jpg", alt: "Speckled charcoal crochet pom-pom beanie" },
      {
        src: "/products/hats/3-studio-sq-v5.jpg",
        alt: "Two people wearing handmade crochet pom-pom beanies",
      },
    ],
    sizes: [
      { id: "baby", label: "Baby", price: 19 },
      { id: "toddler", label: "Toddler", price: 21 },
      { id: "child", label: "Child", price: 22 },
      { id: "teen", label: "Teen", price: 24 },
      { id: "adult", label: "Adult", price: 25 },
    ],
    defaultSizeId: "adult",
    showPomPomPicker: true,
    yarns: CHARISMA_YARNS,
  },
];

export function isProductListed(product: Product): boolean {
  return !product.hidden;
}

/** Products shown on the shop and product pages. */
export const listedProducts = products.filter(isProductListed);

export function getProduct(id: string): Product | undefined {
  const product = products.find((p) => p.id === id);
  if (!product || product.hidden) return undefined;
  return product;
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(0)}`;
}

export function formatPriceOrTbd(priceTbd: boolean, price: number): string {
  return priceTbd ? "TBD" : formatPrice(price);
}

export function getSizeUnitPrice(product: Product, sizeId: string): number {
  const size = product.sizes.find((s) => s.id === sizeId);
  if (size?.price != null) return size.price;
  return product.price;
}

/** Lowest list price when sizes set their own prices; otherwise `product.price`. */
export function getProductListPrice(product: Product): number {
  const sizePrices = product.sizes
    .map((s) => s.price)
    .filter((p): p is number => p != null);
  if (sizePrices.length > 0) return Math.min(...sizePrices);
  return product.price;
}

/** Shop cards and grids when size prices differ. */
export function formatProductListPrice(product: Product): string {
  const min = getProductListPrice(product);
  const max = Math.max(
    product.price,
    ...product.sizes.map((s) => s.price ?? product.price)
  );
  if (min !== max) return `${formatPrice(min)}\u2013${formatPrice(max)}`;
  return formatPrice(min);
}
