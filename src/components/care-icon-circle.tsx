import type { ReactNode } from "react";
import { careSurfaceClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";

const careTextLineHeight = 1.375;

export function CareIconCircle({
  lineCount = 3,
  className,
  iconClassName,
  children,
}: {
  lineCount?: number;
  className?: string;
  iconClassName?: string;
  children: ReactNode;
}) {
  const size = `calc(0.875rem * ${careTextLineHeight} * ${lineCount})`;
  const iconScale =
    lineCount <= 2
      ? "size-[1.3125rem]"
      : lineCount === 3
        ? "size-[1.32rem]"
        : "size-[1.2rem]";

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-ink",
        careSurfaceClass,
        className
      )}
      style={{ width: size, height: size }}
    >
      <span className={cn(iconScale, iconClassName)}>{children}</span>
    </span>
  );
}
