import { BLANKET_YARNS } from "@/data/blanket";
import { HAT_POM_POM_OPTIONS } from "@/lib/hat-pom-pom";
import { BOBBINY_PREMIUM_5MM_YARNS } from "@/data/bobbiny-premium-5mm";
import { BERNAT_BLANKET_BIG_YARNS } from "@/data/bernat-blanket-big";
import { CHARISMA_YARNS } from "@/data/charisma";
import { HAT_YARNS } from "@/data/hat-yarns";
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
  hatStyle?: "slouchy" | "short-tip";
  priceTbd?: boolean;
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
  shownStyle?: string;
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
  imageShownStyle?: string;
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
    "id": "blanket",
    "name": "Chunky chenille blanket",
    "price": 178,
    "category": "Home",
    "imageSrc": "/products/Blanket/blanket 5.jpg",
    "imageAlt": "White blanket spread out with its ribbed border held in one hand",
    "imageShownColor": "White",
    "galleryImages": [
      {
        "src": "/products/Blanket/blanket 2.jpg",
        "alt": "White crochet blanket hanging over the side of a sofa",
        "shownColor": "White"
      },
      {
        "src": "/products/Blanket/blanket 4.jpg",
        "alt": "Hand resting on a white ribbed crochet blanket",
        "shownColor": "White"
      },
      {
        "src": "/products/Blanket/blanket 6.jpg",
        "alt": "Close-up of the white blanket edge held between fingers",
        "shownColor": "White"
      },
      {
        "src": "/products/Blanket/blanket 7.jpg",
        "alt": "Close-up of folded ribbed white crochet blanket",
        "shownColor": "White"
      },
      {
        "src": "/products/Blanket/blanket 9.jpg",
        "alt": "Close-up of plush white chenille blanket stitches",
        "shownColor": "White"
      },
      {
        "src": "/products/Blanket/blanket 11.jpg",
        "alt": "Side view of a phone on plush white chenille stitches",
        "shownColor": "White"
      },
      {
        "type": "video",
        "src": "/products/Blanket/blanket 12-silent-v2.mp4",
        "alt": "White crochet blanket product video",
        "shownColor": "White",
        "poster": "/products/Blanket/blanket 5.jpg"
      }
    ],
    "sizes": [
      {
        "id": "lovey",
        "label": "Lovey · 12 × 12 in",
        "price": 18
      },
      {
        "id": "security",
        "label": "Security · 18 × 24 in",
        "price": 36
      },
      {
        "id": "baby",
        "label": "Baby · 30 × 36 in",
        "price": 71
      },
      {
        "id": "receiving",
        "label": "Receiving · 40 × 40 in",
        "price": 89
      },
      {
        "id": "crib",
        "label": "Lap / crib · 36 × 52 in",
        "price": 107
      },
      {
        "id": "throw",
        "label": "Throw · 50 × 60 in",
        "price": 160
      },
      {
        "id": "large-throw",
        "label": "Large throw · 48 × 71 in",
        "price": 178
      },
      {
        "id": "twin",
        "label": "Twin · 66 × 90 in",
        "price": 320
      },
      {
        "id": "full",
        "label": "Full · 80 × 90 in",
        "price": 391
      },
      {
        "id": "queen",
        "label": "Queen · 90 × 100 in",
        "price": 480
      },
      {
        "id": "king",
        "label": "King · 108 × 100 in",
        "price": 569
      }
    ],
    "defaultSizeId": "large-throw",
    "defaultYarnId": "sweet-snuggles-white",
    "yarns": BLANKET_YARNS
  },
  {
    id: "christmas-stockings",
    name: "Christmas stockings",
    price: 35,
    category: "Holiday",
    imageSrc: "/products/christmas-stockings/christmas stockings 1.jpg",
    imageAlt: "Row of handmade crochet Christmas stockings in holiday colors",
    imageShownColor: "Holiday warm palette (left), Holiday soft palette (right)",
    galleryImages: [
      { src: "/products/christmas-stockings/christmas stockings 2.jpg", alt: "Red crochet Christmas stocking with ribbed cuff and tassel", shownColor: "Red" },
      { src: "/products/christmas-stockings/christmas stockings 3.jpg", alt: "Cream crochet Christmas stocking with ribbed cuff and tassel", shownColor: "Off White" },
      { src: "/products/christmas-stockings/christmas stockings 4.jpg", alt: "Pine green crochet Christmas stocking with ribbed cuff and tassel", shownColor: "Pine" },
      { src: "/products/christmas-stockings/christmas stockings 5.jpg", alt: "Hand holding a striped crochet Christmas stocking in the Holiday soft palette", shownColor: "Holiday soft palette" },
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
    imageSrc: "/products/coasters/coasters 1.jpg",
    imageAlt: "Eucalyptus green crochet coaster held between fingers",
    imageShownColor: "Eucalyptus Green",
    defaultYarnId: "bobbiny-5mm-eucalyptus-green",
    galleryImages: [
      { src: "/products/coasters/coasters 2.jpg", alt: "Hand holding a stack of eucalyptus green handmade crochet coasters", shownColor: "Eucalyptus Green" },
      { src: "/products/coasters/coasters 3.jpg", alt: "Close-up of a eucalyptus green crochet coaster with a black mug and by Diana label tag", shownColor: "Eucalyptus Green" },
    ],
    sizes: [{ id: "one", label: "One coaster" }],
    hideSizePicker: true,
    dimensions: {
      lines: ['4.5" × 4.5"'],
    },
    quantityPicker: { min: 4, max: 12 },
    yarns: BOBBINY_PREMIUM_5MM_YARNS,
  },
  {
    id: "placemats",
    name: "Placemats",
    price: 20,
    category: "Table",
    imageSrc: "/products/placemats/placemats 1.jpg",
    imageAlt: "Stack of golden natural crochet placemats with fine gold fibers",
    imageShownColor: "Golden Natural",
    galleryImages: [
      { src: "/products/placemats/placemats 2.jpg", alt: "Golden natural crochet placemat with a ceramic plate, fork, and spoon", shownColor: "Golden Natural" },
      { type: "video", src: "/products/placemats/placemats 3-silent-v2.mp4", alt: "Placemats product video", shownColor: "Golden Natural", poster: "/products/placemats/placemats 1.jpg" },
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
    imageSrc: "/products/elf-hat/elf hat 1.jpg",
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
    price: 65,
    category: "Holiday",
    imageSrc: "/products/mushroom hat/mushroom hat 1.jpg",
    imageShownStyle: "Slouchy, long tip",
    imageAlt: "Man wearing a red crochet mushroom hat with white spots and brim",
    galleryImages: [
      { shownStyle: "Slouchy, long tip", src: "/products/mushroom hat/mushroom hat 2.jpg", alt: "Side view of a red crochet mushroom hat with white spots and a leather tag" },
      { shownStyle: "Slouchy, long tip", src: "/products/mushroom hat/mushroom hat 3.jpg", alt: "Woman wearing a red crochet mushroom hat with white spots and brim" },
      { shownStyle: "Short tip", src: "/products/mushroom hat/mushroom hat 4.jpg", alt: "Short-tip red and white crochet mushroom hat on a black mannequin against a neutral studio background" },
      { shownStyle: "Short tip", src: "/products/mushroom hat/mushroom hat 5.jpg", alt: "Short-tip mushroom hat on a black mannequin showing the raised brim and cream crochet underside" },
    ],
    sizes: [
      { id: "baby", hatStyle: "slouchy", label: "Baby", price: 40 },
      { id: "toddler", hatStyle: "slouchy", label: "Toddler", price: 46 },
      { id: "child", hatStyle: "slouchy", label: "Child", price: 52 },
      { id: "adult", hatStyle: "slouchy", label: "Adult", price: 65 },
      { id: "short-tip-baby", label: "Baby", hatStyle: "short-tip", price: 34 },
      { id: "short-tip-toddler", label: "Toddler", hatStyle: "short-tip", price: 39 },
      { id: "short-tip-child", label: "Child", hatStyle: "short-tip", price: 44 },
      { id: "short-tip-adult", label: "Adult", hatStyle: "short-tip", price: 55 },
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
    imageSrc: "/products/hotpads/hotpads 1.jpg",
    imageAlt: "Stack of terracotta handmade crochet hot pads",
    imageShownColor: "Terracotta",
    defaultYarnId: "bobbiny-5mm-terracotta",
    galleryImages: [
      { src: "/products/hotpads/hotpads 2.jpg", alt: "Hand fanning out terracotta crochet hot pads", shownColor: "Terracotta" },
      { src: "/products/hotpads/hotpads 3.jpg", alt: "Side view of stacked terracotta crochet hot pads", shownColor: "Terracotta" },
      { src: "/products/hotpads/hotpads 4.jpg", alt: "Close-up comparison of warm beige hotpads with removable leather labels wrapped around the edge and used as a hanging loop", shownColor: "Warm Beige" },
      { src: "/products/hotpads/hotpads 5.jpg", alt: "Warm beige crochet hotpad with a glass candle", shownColor: "Warm Beige" },
      { src: "/products/hotpads/hotpads 6.jpg", alt: "Warm beige crochet hotpad under a stainless steel saucepan", shownColor: "Warm Beige" },
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
    quantityPicker: { min: 2, max: 10 },
    yarns: BOBBINY_PREMIUM_5MM_YARNS,
  },
  {
    id: "cat-cave",
    isNew: true,
    name: "Cat or small dog cave",
    price: 50,
    category: "Pets",
    imageSrc: "/products/cat cave/cat or small dog cave 1.jpg",
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
    imageSrc: "/products/wine-bottle-holders/wine bottle holders 1.jpg",
    imageAlt: "Two handmade crochet wine bottle holders in cream and burgundy",
    galleryImages: [
      { src: "/products/wine-bottle-holders/wine bottle holders 2.jpg", alt: "Crochet wine bottle holder close-up" },
    ],
    sizes: [{ id: "one", label: "One holder" }],
    yarns: BOBBINY_PREMIUM_5MM_YARNS,
  },
  {
    id: "hats",
    name: "Hats",
    price: 25,
    category: "Hats",
    imageSrc: "/products/hats/hats 1.jpg",
    imageAlt: "Two handmade pom-pom beanies in rust and speckled charcoal yarn",
    galleryImages: [
      { src: "/products/hats/hats 2.jpg", alt: "Speckled charcoal crochet pom-pom beanie" },
      {
        src: "/products/hats/hats 3.jpg",
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
    yarns: HAT_YARNS,
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
  ) + (product.showPomPomPicker ? Math.max(...HAT_POM_POM_OPTIONS.map(option => option.priceAddUsd)) : 0);
  if (min !== max) return `${formatPrice(min)}\u2013${formatPrice(max)}`;
  return formatPrice(min);
}
