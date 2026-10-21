import { CHARISMA_HOLIDAY_PIZZA_SLICE_COLORS } from "@/data/charisma-holiday-colors";
import { YarnPizzaSwatch } from "@/components/yarn-pizza-swatch";

type Props = {
  className?: string;
  label?: string;
  decorative?: boolean;
  fill?: boolean;
};

export function HolidayPizzaSwatch({
  className,
  label = "Classic palette: off white, pine, red",
  decorative = false,
  fill = true,
}: Props) {
  return (
    <YarnPizzaSwatch
      sliceColors={CHARISMA_HOLIDAY_PIZZA_SLICE_COLORS}
      className={className}
      label={label}
      decorative={decorative}
      fill={fill}
    />
  );
}
