import { cn } from "@/lib/utils";

/** Shared vertical rhythm for PDP purchase options (size, color, tag, quantity, CTA). */
export const pickerSectionGapClass = "gap-8";

export const pickerFieldsetClass =
  "m-0 min-w-0 border-0 p-0";

export const pickerLegendClass =
  "mb-3 block w-full text-[calc(0.875rem*1.5)] leading-snug text-muted-foreground";

/** Machine-wash icon circle; selected tag chips use the same fill. */
export const careSurfaceClass = "bg-[#e8e8e8] dark:bg-[#141414]";
export const careSurfaceHoverClass =
  "hover:bg-[#e8e8e8] dark:hover:bg-[#141414]";

/** Tag and size option pills (selected = ink border + care surface). */
export const pickerChipBase =
  "inline-flex w-fit max-w-full min-h-11 cursor-pointer items-center rounded-full border-2 px-4 py-2.5 text-left text-sm leading-snug text-foreground transition-colors touch-manipulation select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

/** White (light) / transparent (dark) behind typed values, not chip gray. */
export const formFieldSurfaceClass = "bg-white dark:bg-transparent";

/** Text inputs and textareas: default ink border; override border color per field if needed. */
export const formFieldInputClass = cn(
  "min-w-0 rounded-lg border-2 border-ink px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  formFieldSurfaceClass
);

/** Fills the circular swatch button (works with Next/Image `fill`, `img`, or inline SVG). */
export const yarnSwatchCircleMediaClass =
  "pointer-events-none absolute inset-0 h-full w-full";

/** Yarn color circles: cover the frame and zoom slightly past crop edges. */
export const yarnSwatchCircleImageClass = cn(
  yarnSwatchCircleMediaClass,
  "scale-[1.15] object-cover object-center"
);

export const yarnSwatchCircleSvgClass = cn(
  yarnSwatchCircleMediaClass,
  "overflow-hidden rounded-full"
);
