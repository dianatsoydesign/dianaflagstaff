import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";

const rowClass =
  "flex w-full flex-wrap items-center justify-start text-left text-ink";

/** Shop grid: fixed price size; name keeps fluid display scale. */
const cardNameClass =
  "font-display text-[length:calc(0.0072*min(100vh,900px)_+_1rem)] leading-none tracking-[-0.04em] md:text-[length:min(calc(0.72vw_+_1rem),28.96px)]";

const cardNameFontSizeClass =
  "text-[length:calc(0.0072*min(100vh,900px)_+_1rem)] md:text-[length:min(calc(0.72vw_+_1rem),28.96px)]";

const cardPriceClass =
  "self-center font-sans text-[1.125rem] leading-none tabular-nums";

/** PDP + welcome: shared line box (em) for vertical alignment. */
const nameSizeByVariant = {
  detail: "text-[clamp(1.75rem,2.3vw,2.3rem)]",
  featured: "text-[1.32rem]",
} as const;

const nameTypeByVariant = {
  detail: "font-display tracking-[-0.04em]",
  featured: "font-sans leading-none",
} as const;

// Keep name descenders inside its alignment box; price digits use cap-to-baseline bounds.
const textCellClass = "block [text-box-trim:trim-both] [text-box-edge:cap_alphabetic]";
const nameCellClass = "block [text-box-trim:trim-both] [text-box-edge:cap_text]";

const priceClassByVariant = {
  detail: "self-center font-sans text-[1.4375rem] leading-none tabular-nums",
  featured: "self-center font-sans text-[1.125rem] leading-none tabular-nums",
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
        "mx-[0.65em] inline-flex h-[0.18em] shrink-0 self-center items-center justify-center leading-none",
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
  const cardRange = !priceTbd && priceLabel?.match(/^(\$[\d,.]+)\u2013(\$[\d,.]+)$/);

  const quantityPrice = !priceTbd && priceLabel?.match(/^(\d+) for (\$[\d,.]+)$/);
  const quantityPriceContent = quantityPrice ? (
    <span className="whitespace-nowrap">
      {quantityPrice[1]}{" "}<span className="mx-[0.25em]">for</span>{" "}{quantityPrice[2]}
    </span>
  ) : null;

  if (variant === "card") {
    return (
      <p className={cn(rowClass, "gap-y-1", className)}>
        <span className={cn(nameCellClass, cardNameClass, nameClassName)}>
          {name}
        </span>
        <NamePriceDot fontSizeClass={cardNameFontSizeClass} />
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
      <span className={cn(nameCellClass, "leading-none", nameTypeByVariant[variant])}>{name}</span>
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
