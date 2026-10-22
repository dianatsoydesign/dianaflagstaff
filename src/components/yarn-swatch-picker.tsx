"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { StockStatus, YarnColor } from "@/data/products";
import {
  bobbinyColorGroupId,
  bobbinyGroupsForYarns,
  filterBobbinyYarnsByGroup,
  isBobbinyColorCatalog,
  type BobbinyColorGroupId,
} from "@/data/bobbiny-color-order";
import {
  charismaColorGroupId,
  charismaGroupsForYarns,
  isCharismaColorCatalog,
} from "@/data/charisma-color-groups";
import {
  CHARISMA_HOLIDAY_PIZZA_YARN_ID,
  charismaHasHolidayYarns,
  filterCharismaYarnsForPicker,
  isCharismaHolidayPizzaYarn,
  type CharismaPickerGroupId,
} from "@/data/charisma-holiday-colors";
import {
  CHARISMA_SOFT_PALETTE_YARN_ID,
  CHARISMA_SOFT_PALETTE_SLICE_COLORS,
  charismaHasSoftPaletteYarns,
  isCharismaSoftPaletteYarn,
} from "@/data/charisma-soft-palette";
import {
  CHARISMA_WARM_PALETTE_YARN_ID,
  CHARISMA_WARM_PALETTE_SLICE_COLORS,
  charismaHasWarmPaletteYarns,
  isCharismaWarmPaletteYarn,
} from "@/data/charisma-warm-palette";
import { YarnPizzaSwatch } from "@/components/yarn-pizza-swatch";
import { isSelectable } from "@/lib/yarn-stock";
import {
  careSurfaceClass,
  careSurfaceHoverClass,
  pickerChipBase,
  pickerFieldsetClass,
  pickerLegendClass,
  yarnSwatchCircleImageClass,
} from "@/components/picker-styles";
import { bernatColorGroupId, bernatGroupsForYarns, type BernatColorGroupId } from "@/data/bernat-blanket-big";
import { HolidayPizzaSwatch } from "@/components/holiday-pizza-swatch";
import { colorName } from "@/lib/color-name";
import { isBobbinyYarnId, productPhotoBgClass } from "@/lib/product-photo-bg";

function colorThumbSrc(yarn: {
  id: string;
  swatchSrc: string;
  detailSwatchSrc?: string;
}) {
  if (yarn.id.startsWith("bobbiny-5mm-")) {
    return `/yarn-swatches/bobbiny/${yarn.id}.webp`;
  }
  return yarn.detailSwatchSrc ?? yarn.swatchSrc;
}

type CatalogGroupId = BobbinyColorGroupId | CharismaPickerGroupId | BernatColorGroupId;

type Props = {
  allowHolidayFilter?: boolean;
  keyboardNavigation?: boolean;
  yarns: (YarnColor & { liveStatus?: StockStatus })[];
  value: string | null;
  onChange: (yarnId: string) => void;
  /** Mouse hover only, so a tap on touch screens doesn't leave a preview stuck. */
  onPreview?: (yarnId: string | null) => void;
  legend?: string;
  /** Pins the family chip on first paint (e.g. Holiday while default yarn is off white). */
  initialGroupFilter?: CatalogGroupId | null;
};

export function YarnSwatchPicker({
  yarns,
  allowHolidayFilter = false,
  keyboardNavigation = true,
  value,
  onChange,
  onPreview,
  legend = "Yarn color",
  initialGroupFilter,
}: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const useCharismaGroups =
    yarns.length > 20 && isCharismaColorCatalog(yarns);
  const useBobbinyGroups =
    !useCharismaGroups && yarns.length > 20 && isBobbinyColorCatalog(yarns);
  const useBernatGroups = yarns.length > 0 && yarns.every((y) => y.id.startsWith("bernat-blanket-big-"));
  const useGroupFilter = useCharismaGroups || useBobbinyGroups || useBernatGroups;

  const groupOptions = useCharismaGroups
    ? charismaGroupsForYarns(yarns)
    : useBobbinyGroups
      ? bobbinyGroupsForYarns(yarns)
      : useBernatGroups
        ? bernatGroupsForYarns(yarns)
        : [];

  const [groupFilterChoice, setGroupFilterChoice] = useState<
    { source: "auto" } | { source: "user"; groupId: CatalogGroupId | null }
  >(() =>
    initialGroupFilter !== undefined
      ? { source: "user", groupId: initialGroupFilter }
      : { source: "auto" }
  );

  function yarnGroupId(yarnId: string): CatalogGroupId | null {
    if (isCharismaHolidayPizzaYarn(yarnId)) return "holiday";
    if (isCharismaSoftPaletteYarn(yarnId)) return null;
    if (isCharismaWarmPaletteYarn(yarnId)) return null;
    const yarn = yarns.find((y) => y.id === yarnId);
    if (!yarn) return null;
    if (useBernatGroups) return bernatColorGroupId(yarn);
    if (useCharismaGroups) return charismaColorGroupId(yarn);
    if (useBobbinyGroups) return bobbinyColorGroupId(yarnId);
    return null;
  }

  const groupFilter =
    groupFilterChoice.source === "auto"
      ? value
        ? yarnGroupId(value)
        : null
      : groupFilterChoice.groupId;

  const showHolidayChip = allowHolidayFilter && useCharismaGroups && charismaHasHolidayYarns(yarns);
  const showSoftPaletteSwatch =
    useCharismaGroups && charismaHasSoftPaletteYarns(yarns);
  const showWarmPaletteSwatch =
    useCharismaGroups && charismaHasWarmPaletteYarns(yarns);

  const displayedYarns = useGroupFilter
    ? useCharismaGroups
      ? filterCharismaYarnsForPicker(yarns, groupFilter as CharismaPickerGroupId | null)
      : useBernatGroups
        ? yarns.filter((yarn) => !groupFilter || bernatColorGroupId(yarn) === groupFilter)
        : filterBobbinyYarnsByGroup(yarns, groupFilter as BobbinyColorGroupId | null)
    : yarns;

  const readOnlyColor = yarns.length === 1;
  const shown =
    yarns.find((y) => y.id === hoveredId) ??
    yarns.find((y) => y.id === value) ??
    (readOnlyColor ? yarns[0] : null);

  function preview(id: string | null) {
    setHoveredId(id);
    onPreview?.(id);
  }

  function selectGroupFilter(next: CatalogGroupId | null) {
    setGroupFilterChoice({ source: "user", groupId: next });
  }

  // Responsive columns: more for large catalogs (Bobbiny = 50+), fewer for small ones
  const cols =
    yarns.length > 20
      ? "grid-cols-6 sm:grid-cols-8 lg:grid-cols-10"
      : yarns.length > 8
        ? "grid-cols-5 sm:grid-cols-6 lg:grid-cols-8"
        : "grid-cols-4 sm:grid-cols-5";

  return (
    <fieldset className={pickerFieldsetClass}>
      <legend className={cn(pickerLegendClass, readOnlyColor && "mb-0")}>
        {shown ? (
          <>
            <span className="sr-only">{legend}: </span>
            Color:{" "}
            <span className="font-medium text-foreground">
              {colorName(shown.name)}
            </span>
          </>
        ) : (
          legend
        )}
      </legend>

      {readOnlyColor ? null : (
      <>
      {useGroupFilter ? (
        <div
          className="mb-3 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Color family"
        >
          {showHolidayChip ? (
            <button
              type="button"
              onClick={() => selectGroupFilter("holiday")}
              className={cn(
                pickerChipBase,
                "gap-2",
                groupFilter === "holiday"
                  ? cn("border-ink font-medium", careSurfaceClass)
                  : cn(
                      "border-border bg-card/80",
                      "hover:border-ink/40",
                      careSurfaceHoverClass,
                      "active:bg-[#e8e8e8] dark:active:bg-[#141414]"
                    )
              )}
            >
              <HolidayPizzaSwatch className="size-5" decorative fill={false} />
              Holiday
            </button>
          ) : null}
          {groupOptions.map((group) => {
            const isSelected = groupFilter === group.id;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => selectGroupFilter(group.id)}
                className={cn(
                  pickerChipBase,
                  isSelected
                    ? cn("border-ink font-medium", careSurfaceClass)
                    : cn(
                        "border-border bg-card/80",
                        "hover:border-ink/40",
                        careSurfaceHoverClass,
                        "active:bg-[#e8e8e8] dark:active:bg-[#141414]"
                      )
                )}
              >
                {group.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => selectGroupFilter(null)}
            className={cn(
              pickerChipBase,
              groupFilter === null
                ? cn("border-ink font-medium", careSurfaceClass)
                : cn(
                    "border-border bg-card/80",
                    "hover:border-ink/40",
                    careSurfaceHoverClass,
                    "active:bg-[#e8e8e8] dark:active:bg-[#141414]"
                  )
            )}
          >
            All colors
          </button>
        </div>
      ) : null}

      <div
        className={cn("grid gap-1.5", cols)}
        role={keyboardNavigation ? "radiogroup" : undefined}
        aria-label={keyboardNavigation ? "Yarn color" : undefined}
        onKeyDown={keyboardNavigation ? (e) => {
          if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
          const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
          const current = buttons.indexOf(e.target as HTMLButtonElement);
          if (current < 0 || !buttons.length) return;
          e.preventDefault();
          const index = e.key === "Home" ? 0 : e.key === "End" ? buttons.length - 1 : (current + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + buttons.length) % buttons.length;
          buttons[index].focus();
          buttons[index].click();
        } : undefined}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") preview(null);
        }}
      >
        {displayedYarns.map((yarn) => {
          const status = yarn.liveStatus ?? yarn.stockStatus;
          const selectable = isSelectable(status);
          const isSelected = value === yarn.id;

          return (
            <button
              key={yarn.id}
              type="button"
              disabled={!selectable}
              onClick={() => onChange(yarn.id)}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse" && selectable) preview(yarn.id);
              }}
              role={keyboardNavigation ? "radio" : undefined}
              aria-checked={keyboardNavigation ? isSelected : undefined}
              tabIndex={keyboardNavigation ? (isSelected || (!(showHolidayChip && groupFilter === "holiday" && (value === CHARISMA_HOLIDAY_PIZZA_YARN_ID || (showSoftPaletteSwatch && value === CHARISMA_SOFT_PALETTE_YARN_ID) || (showWarmPaletteSwatch && value === CHARISMA_WARM_PALETTE_YARN_ID))) && !displayedYarns.some((y) => y.id === value && isSelectable(y.liveStatus ?? y.stockStatus)) && yarn.id === displayedYarns.find((y) => isSelectable(y.liveStatus ?? y.stockStatus))?.id) ? 0 : -1) : undefined}
              aria-pressed={keyboardNavigation ? undefined : isSelected}
              aria-label={colorName(yarn.name)}
              title={colorName(yarn.name)}
              className={cn(
                "relative aspect-square w-full overflow-hidden rounded-full border-2 transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                isSelected
                  ? "border-ink"
                  : "border-transparent hover:border-ink/40",
                isBobbinyYarnId(yarn.id) && productPhotoBgClass,
                !selectable && "cursor-not-allowed opacity-40"
              )}
            >
              <Image
                src={colorThumbSrc(yarn)}
                alt={colorName(yarn.name)}
                fill
                className={yarnSwatchCircleImageClass}
                sizes="60px"
              />
            </button>
          );
        })}
        {showHolidayChip && groupFilter === "holiday" ? (
          <button
            type="button"
            onClick={() => onChange(CHARISMA_HOLIDAY_PIZZA_YARN_ID)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") preview(CHARISMA_HOLIDAY_PIZZA_YARN_ID);
            }}
            role={keyboardNavigation ? "radio" : undefined}
            aria-checked={keyboardNavigation ? value === CHARISMA_HOLIDAY_PIZZA_YARN_ID : undefined}
            tabIndex={keyboardNavigation ? (value === CHARISMA_HOLIDAY_PIZZA_YARN_ID ? 0 : -1) : undefined}
            aria-pressed={keyboardNavigation ? undefined : value === CHARISMA_HOLIDAY_PIZZA_YARN_ID}
            aria-label="Classic"
            title="Classic"
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-full border-2 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              value === CHARISMA_HOLIDAY_PIZZA_YARN_ID
                ? "border-ink"
                : "border-transparent hover:border-ink/40"
            )}
          >
            <HolidayPizzaSwatch decorative />
          </button>
        ) : null}
        {showHolidayChip && groupFilter === "holiday" && showSoftPaletteSwatch ? (
          <button
            type="button"
            onClick={() => onChange(CHARISMA_SOFT_PALETTE_YARN_ID)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") {
                preview(CHARISMA_SOFT_PALETTE_YARN_ID);
              }
            }}
            role={keyboardNavigation ? "radio" : undefined}
            aria-checked={keyboardNavigation ? value === CHARISMA_SOFT_PALETTE_YARN_ID : undefined}
            tabIndex={keyboardNavigation ? (value === CHARISMA_SOFT_PALETTE_YARN_ID ? 0 : -1) : undefined}
            aria-pressed={keyboardNavigation ? undefined : value === CHARISMA_SOFT_PALETTE_YARN_ID}
            aria-label="Soft palette"
            title="Soft palette"
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-full border-2 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              value === CHARISMA_SOFT_PALETTE_YARN_ID
                ? "border-ink"
                : "border-transparent hover:border-ink/40"
            )}
          >
            <YarnPizzaSwatch
              sliceColors={CHARISMA_SOFT_PALETTE_SLICE_COLORS}
              decorative
            />
          </button>
        ) : null}
        {showHolidayChip && groupFilter === "holiday" && showWarmPaletteSwatch ? (
          <button
            type="button"
            onClick={() => onChange(CHARISMA_WARM_PALETTE_YARN_ID)}
            onPointerEnter={(e) => {
              if (e.pointerType === "mouse") {
                preview(CHARISMA_WARM_PALETTE_YARN_ID);
              }
            }}
            role={keyboardNavigation ? "radio" : undefined}
            aria-checked={keyboardNavigation ? value === CHARISMA_WARM_PALETTE_YARN_ID : undefined}
            tabIndex={keyboardNavigation ? (value === CHARISMA_WARM_PALETTE_YARN_ID ? 0 : -1) : undefined}
            aria-pressed={keyboardNavigation ? undefined : value === CHARISMA_WARM_PALETTE_YARN_ID}
            aria-label="Warm palette"
            title="Warm palette"
            className={cn(
              "relative aspect-square w-full overflow-hidden rounded-full border-2 transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              value === CHARISMA_WARM_PALETTE_YARN_ID
                ? "border-ink"
                : "border-transparent hover:border-ink/40"
            )}
          >
            <YarnPizzaSwatch
              sliceColors={CHARISMA_WARM_PALETTE_SLICE_COLORS}
              decorative
            />
          </button>
        ) : null}
      </div>
      </>
      )}
    </fieldset>
  );
}
