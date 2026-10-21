/**
 * Made-to-order requests from free patterns Diana wants to try.
 * Attribution is required. Never present others' work as hers.
 *
 * When Diana supplies real free-pattern URLs and permitted reference
 * images, replace the placeholder entries below. Until then, use
 * neutral yarn/process imagery only (no other makers' FO photos).
 */

export type PatternRequestItem = {
  id: string;
  title: string;
  blurb: string;
  priceFrom: number;
  /** Pattern attribution */
  patternName: string;
  designerName: string;
  patternUrl: string | null;
  patternLicenseNote: string;
  /** Reference image: neutral/process placeholder unless Diana has permission */
  referenceImageSrc: string;
  referenceImageAlt: string;
  photoCredit: string;
  photoIsMakerOwn: false;
  sizes: { id: string; label: string }[];
  /** Yarn options reuse catalog yarn ids where possible */
  yarnIds: string[];
};

export const patternRequests: PatternRequestItem[] = [
  {
    id: "req-cable-cowl",
    title: "Cable texture cowl",
    blurb:
      "A snug winter cowl with a soft cable texture. Diana hasn’t made this yet. Request a make from the free pattern.",
    priceFrom: 38,
    patternName: "River Cable Cowl",
    designerName: "Placeholder Designer (replace with real credit)",
    patternUrl: null,
    patternLicenseNote: "Free pattern: link coming once Diana confirms the source",
    referenceImageSrc:
      "https://images.unsplash.com/photo-1631541909061-71e349d1f203?w=900&q=80",
    referenceImageAlt: "Neutral yarn and knitting needles (process placeholder)",
    photoCredit: "Neutral process photo (Unsplash), not a finished object by another maker",
    photoIsMakerOwn: false,
    sizes: [
      { id: "teen", label: "Teen / small" },
      { id: "adult", label: "Adult" },
    ],
    yarnIds: ["forest-heather", "slate-mist", "oat-cream"],
  },
  {
    id: "req-market-tote",
    title: "Sturdy market tote",
    blurb:
      "A roomy tote for farmers-market runs. Made-to-order from a free pattern Diana wants to try this season.",
    priceFrom: 45,
    patternName: "Open Lattice Market Bag",
    designerName: "Placeholder Designer (replace with real credit)",
    patternUrl: null,
    patternLicenseNote: "Free pattern: awaiting Diana’s pattern link",
    referenceImageSrc:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
    referenceImageAlt: "Skeins of yarn on a table (process placeholder)",
    photoCredit: "Neutral yarn photo (Unsplash), reference only, not my work",
    photoIsMakerOwn: false,
    sizes: [{ id: "one", label: "One size" }],
    yarnIds: ["meadow-sage", "clay-path", "oat-cream"],
  },
  {
    id: "req-star-garland",
    title: "Star garland string",
    blurb:
      "A holiday garland of small stars for a mantle or doorway. Request before peak December weekends.",
    priceFrom: 30,
    patternName: "Twinkle Star Garland",
    designerName: "Placeholder Designer (replace with real credit)",
    patternUrl: null,
    patternLicenseNote: "Free pattern: link TBA",
    referenceImageSrc:
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=900&q=80",
    referenceImageAlt: "Soft workspace with craft materials (process placeholder)",
    photoCredit: "Neutral workspace photo (Unsplash), not a finished object by another maker",
    photoIsMakerOwn: false,
    sizes: [{ id: "short", label: "Short (~4 ft)" }, { id: "long", label: "Long (~6 ft)" }],
    yarnIds: ["holly-red", "pine-needle", "oat-cream", "cranberry-dusk"],
  },
];
