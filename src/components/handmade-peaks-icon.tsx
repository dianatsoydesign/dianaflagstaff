import Image from "next/image";
import { cn } from "@/lib/utils";

/** Flagstaff peaks mark (transparent PNG). */
export function HandmadePeaksIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/handmade-peaks.png"
      alt=""
      aria-hidden
      width={22}
      height={14}
      className={cn(
        "inline-block shrink-0 object-contain object-center dark:invert",
        className
      )}
    />
  );
}

/** Renders peaks before the word “Handmade” in taglines and labels. */
export function HandmadePrefixLabel({
  text,
  iconClassName,
  className,
}: {
  text: string;
  iconClassName?: string;
  className?: string;
}) {
  if (!text.startsWith("Handmade")) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-[0.35em]", className)}>
      <HandmadePeaksIcon
        className={cn(
          "h-[0.95em] w-[1.45em] translate-y-[0.02em]",
          iconClassName
        )}
      />
      <span>{text}</span>
    </span>
  );
}
