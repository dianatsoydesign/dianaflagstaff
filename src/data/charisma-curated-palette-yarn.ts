import { isCharismaHolidayPizzaYarn } from "@/data/charisma-holiday-colors";
import { isCharismaSoftPaletteYarn } from "@/data/charisma-soft-palette";
import { isCharismaWarmPaletteYarn } from "@/data/charisma-warm-palette";

export function isCharismaCuratedPaletteYarn(
  yarnId: string | null | undefined
): boolean {
  return (
    isCharismaHolidayPizzaYarn(yarnId) ||
    isCharismaSoftPaletteYarn(yarnId) ||
    isCharismaWarmPaletteYarn(yarnId)
  );
}
