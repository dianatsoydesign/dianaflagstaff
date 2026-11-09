import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";

const rowClass =
  "flex w-full flex-wrap items-center justify-start text-left text-ink";

/** Shared card text scale; Shop supplies its own row size. */
const cardNameFontSizeClass =
  "text-[1.307725rem]";

const cardPriceClass =
  "self-center font-tagline font-light text-ink leading-none tabular-nums";

/** PDP + welcome: shared line box (em) for vertical alignment. */
const nameSizeByVariant = {
  detail: "text-[1.4021015625rem]",
  featured: "text-[1.32rem]",
} as const;

const nameTypeByVariant = {
  detail: "font-display tracking-[-0.04em]",
  featured: "font-sans leading-none",
} as const;

// Equal nominal sizes plus normalized cap heights keep both fonts equally tall.
// Center matching cap-to-baseline boxes; let descenders remain visible.
const textCellClass = "block [font-size-adjust:cap-height_0.7] [text-box-trim:trim-both] [text-box-edge:cap_alphabetic]";
const nameCellClass = textCellClass;

const priceClassByVariant = {
  detail: "self-center font-tagline font-light text-ink leading-none tabular-nums",
  featured: "self-center font-sans font-normal text-muted-foreground leading-none tabular-nums",
} as const;

function NamePriceDot({
  cellHeight,
  fontSizeClass,
}: {
  cellHeight?: string;
  fontSizeClass?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "text-muted-foreground mx-[0.65em] inline-flex h-[0.18em] shrink-0 self-center items-center justify-center leading-none",
        cellHeight,
        fontSizeClass
      )}
    >
      <span className="block size-[0.18em] min-h-[3px] min-w-[3px] rounded-full bg-current" />
    </span>
  );
}

type Variant = "card" | "detail" | "featured";

type Props = {
  name: string;
  price: number;
  /** When set, shown instead of formatting `price` (e.g. $19–$25). */
  priceLabel?: string;
  priceTbd?: boolean;
  className?: string;
  nameClassName?: string;
  variant?: Variant;
};

export function ProductNamePrice({
  name,
  price,
  priceLabel,
  priceTbd = false,
  className,
  nameClassName,
  variant = "card",
}: Props) {
  const isUnisex = /\s*\(unisex\)\s*$/i.test(name);
  const displayName = isUnisex ? name.replace(/\s*\(unisex\)\s*$/i, "") : name;

  const cardRange = !priceTbd && priceLabel?.match(/^(\$[\d,.]+)\u2013(\$[\d,.]+)$/);

  const quantityPrice = !priceTbd && priceLabel?.match(/^(\d+) for (\$[\d,.]+)$/);
  const quantityPriceContent = quantityPrice ? (
    <span className="whitespace-nowrap">
      {quantityPrice[1]}{" "}<span className="mx-[0.25em]">for</span>{" "}{quantityPrice[2]}
    </span>
  ) : null;

  if (variant === "card") {
    return (
      <p className={cn(rowClass, cardNameFontSizeClass, nameClassName, "gap-y-1", className)}>
        <span className={cn(nameCellClass, "font-display leading-none tracking-[-0.04em]")}>
          {displayName}
        </span>
        {isUnisex && <>
          <NamePriceDot />
          <span className={cn(textCellClass, cardPriceClass)}>unisex</span>
        </>}
        <NamePriceDot />
        <span className={cn(textCellClass, cardPriceClass)}>
          {cardRange ? (
            <>
              <span className="sr-only">{cardRange[1]} to {cardRange[2]}</span>
              <span aria-hidden="true" className="inline-flex items-center whitespace-nowrap">
                <span>{cardRange[1]}</span>
                <span className="mx-[0.35em] h-px w-[0.55em] -translate-y-[0.04em] shrink-0 bg-current" />
                <span>{cardRange[2]}</span>
              </span>
            </>
          ) : priceTbd ? "TBD" : (quantityPriceContent ?? priceLabel ?? formatPrice(price))}
        </span>
      </p>
    );
  }

  const cellClass = cn(textCellClass, "leading-none");

  const content = (
    <>
      <span className={cn(nameCellClass, "leading-none", nameTypeByVariant[variant])}>{displayName}</span>
      {isUnisex && <>
        <NamePriceDot />
        <span className={cn(cellClass, priceClassByVariant[variant])}>unisex</span>
      </>}
      <NamePriceDot />
      <span className={cn(cellClass, priceClassByVariant[variant])}>
        {priceTbd ? "TBD" : (quantityPriceContent ?? priceLabel ?? formatPrice(price))}
      </span>
    </>
  );

  const row = cn(rowClass, nameSizeByVariant[variant], "gap-y-1", className);

  if (variant === "detail") {
    return <h1 className={row}>{content}</h1>;
  }

  return <p className={row}>{content}</p>;
}
