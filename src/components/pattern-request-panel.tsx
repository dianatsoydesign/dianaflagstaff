"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { StockStatus } from "@/data/products";
import { formatPrice } from "@/data/products";
import type { PatternRequestItem } from "@/data/pattern-requests";
import { getYarnById } from "@/data/yarns";
import { useInquiryCart } from "@/lib/inquiry-cart";
import { isSelectable } from "@/lib/yarn-stock";
import { SizePicker } from "@/components/size-picker";
import { YarnSwatchPicker } from "@/components/yarn-swatch-picker";
import { Button } from "@/components/ui/button";

type Props = {
  item: PatternRequestItem;
};

export function PatternRequestPanel({ item }: Props) {
  const { addItem, openAddedDrawer } = useInquiryCart();
  const [sizeId, setSizeId] = useState<string | null>(
    item.sizes.length === 1 ? item.sizes[0].id : null
  );
  const [yarnId, setYarnId] = useState<string | null>(null);
  const [liveStock, setLiveStock] = useState<Record<string, StockStatus>>({});
  const [message, setMessage] = useState<string | null>(null);

  const baseYarns = useMemo(
    () =>
      item.yarnIds
        .map((id) => getYarnById(id))
        .filter((y): y is NonNullable<typeof y> => Boolean(y)),
    [item.yarnIds]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.all(
        baseYarns.map(async (y) => {
          const res = await fetch(`/api/yarn-stock?yarnId=${y.id}`);
          if (!res.ok) return { yarnId: y.id, status: y.stockStatus };
          const data = (await res.json()) as {
            result: { yarnId: string; status: StockStatus };
          };
          return data.result;
        })
      );
      if (cancelled) return;
      const map: Record<string, StockStatus> = {};
      for (const r of results) map[r.yarnId] = r.status;
      setLiveStock(map);
      const first = baseYarns.find((y) =>
        isSelectable(map[y.id] ?? y.stockStatus)
      );
      setYarnId(first?.id ?? null);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [baseYarns]);

  const yarns = baseYarns.map((y) => ({
    ...y,
    liveStatus: liveStock[y.id],
  }));

  function request() {
    setMessage(null);
    const size = item.sizes.find((s) => s.id === sizeId);
    const yarn = baseYarns.find((y) => y.id === yarnId);
    if (!size || !yarn) {
      setMessage("Choose a size and yarn color.");
      return;
    }
    const status = liveStock[yarn.id] ?? yarn.stockStatus;
    if (!isSelectable(status)) {
      setMessage("That yarn is out of stock. Pick another color.");
      return;
    }
    const itemId = addItem({
      kind: "pattern_request",
      productId: item.id,
      productName: item.title,
      sizeId: size.id,
      sizeLabel: size.label,
      yarnId: yarn.id,
      yarnName: yarn.name,
      yarnSwatchSrc: yarn.swatchSrc,
      productImageSrc: item.referenceImageSrc,
      quantity: 1,
      unitPrice: item.priceFrom,
      patternName: item.patternName,
      designerName: item.designerName,
      patternUrl: item.patternUrl,
    });
    openAddedDrawer(itemId);
  }

  return (
    <article className="flex flex-col gap-4 border-t border-border/70 pt-8 first:border-t-0 first:pt-0">
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-muted">
        <Image
          src={item.referenceImageSrc}
          alt={item.referenceImageAlt}
          fill
          className="object-cover opacity-95"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="rounded-lg border border-dashed border-border bg-wash px-3 py-2.5 text-xs leading-relaxed text-foreground">
        <p className="font-medium">Reference photo (not my work)</p>
        <p className="mt-1 text-muted-foreground">{item.photoCredit}</p>
        <p className="mt-2">
          I’ll make this from the free pattern. Pattern:{" "}
          <span className="font-medium text-foreground">{item.patternName}</span>{" "}
          by {item.designerName}.
          {item.patternUrl ? (
            <>
              {" "}
              <a
                href={item.patternUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 transition-opacity hover:opacity-70"
              >
                View free pattern
              </a>
            </>
          ) : (
            <span className="text-muted-foreground">
              {" "}
              ({item.patternLicenseNote})
            </span>
          )}
        </p>
      </div>

      <div>
        <h3 className="font-sans text-[1.32rem] leading-[1.8] text-ink">
          {item.title}
        </h3>
        <p className="font-sans text-base leading-[1.8] text-ink">
          {formatPrice(item.priceFrom)}
        </p>
      </div>

      <SizePicker sizes={item.sizes} value={sizeId} onChange={setSizeId} />
      <YarnSwatchPicker yarns={yarns} value={yarnId} onChange={setYarnId} />

      <Button
        type="button"
        className="h-12 w-full bg-button text-base text-button-foreground hover:bg-button-hover"
        onClick={request}
      >
        Request this make
      </Button>
      {message && (
        <p className="text-center text-sm text-muted-foreground" role="status">
          {message}
        </p>
      )}
    </article>
  );
}
