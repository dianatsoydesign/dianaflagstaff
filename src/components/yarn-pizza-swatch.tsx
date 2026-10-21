import { yarnSwatchCircleSvgClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";

type Props = {
  sliceColors: readonly string[];
  className?: string;
  label?: string;
  decorative?: boolean;
  /** Fill a circular swatch button; false for inline chip icons. */
  fill?: boolean;
};

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
): string {
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

/** Equal wedges clockwise from the top. */
export function YarnPizzaSwatch({
  sliceColors,
  className,
  label,
  decorative = false,
  fill = true,
}: Props) {
  const cx = 50;
  const cy = 50;
  const r = 48;
  const step = 360 / sliceColors.length;
  const slices = sliceColors.map((fill, i) => ({
    fill,
    d: slicePath(cx, cy, r, i * step, (i + 1) * step),
  }));

  return (
    <svg
      viewBox="0 0 100 100"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
      className={cn(
        fill
          ? yarnSwatchCircleSvgClass
          : "block size-full shrink-0 overflow-hidden rounded-full",
        className
      )}
    >
      {slices.map((slice, i) => (
        <path key={i} d={slice.d} fill={slice.fill} />
      ))}
    </svg>
  );
}
