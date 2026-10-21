import { CareIconCircle } from "@/components/care-icon-circle";
import { cn } from "@/lib/utils";

/** Width/height arrows around a rounded square. */
export function DimensionsIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5 shrink-0", className)}
      aria-hidden
    >
      <rect x="2.86" y="5.88" width="11.05" height="11.05" rx="2.04" />
      <path d="M2.86 2.48h11.05" />
      <path d="M1.25 2.48l1.62-1.02M1.25 2.48l1.62 1.02" />
      <path d="M15.53 2.48l-1.62-1.02M15.53 2.48l-1.62 1.02" />
      <path d="M17.74 5.88v11.05" />
      <path d="M17.74 4.26l-1.02 1.62M17.74 4.26l1.02 1.62" />
      <path d="M17.74 18.54l-1.02-1.62M17.74 18.54l1.02-1.62" />
    </svg>
  );
}

export function DimensionsCircle({
  className,
  iconClassName,
  lineCount = 3,
}: {
  className?: string;
  iconClassName?: string;
  lineCount?: number;
}) {
  return (
    <CareIconCircle
      lineCount={lineCount}
      className={className}
      iconClassName={iconClassName}
    >
      <DimensionsIcon className="size-full" />
    </CareIconCircle>
  );
}
