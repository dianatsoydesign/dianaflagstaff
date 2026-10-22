"use client";

import { useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { pickupRange, type PickupTiming } from "@/lib/pickup-estimate";

const localDay = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Phoenix", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());
const serverDay = () => null;
function subscribeToDayChange(onChange: () => void) {
  const timer = window.setInterval(onChange, 60000);
  return () => window.clearInterval(timer);
}

type Props = { timing: PickupTiming | null; customSize: boolean };

export function ProductPickupEstimate({ timing, customSize }: Props) {
  const today = useSyncExternalStore(subscribeToDayChange, localDay, serverDay);
  const range = today && timing ? pickupRange(today, timing) : null;
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
    ...(range && range.start.getUTCFullYear() !== range.end.getUTCFullYear()
      ? { year: "numeric" as const } : {}),
  });
  const dateLabel = range ? formatter.formatRange(range.start, range.end) : timing ? "Calculating dates…" : customSize ? "Timing confirmed on acceptance" : "Choose a color for dates";

  return (
    <section aria-label="Estimated pickup timing" className="min-w-0 rounded-[12px] bg-wash text-sm leading-relaxed text-ink">
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        Estimated Flagstaff pickup: {dateLabel}
      </p>
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[12px] p-4 transition-colors hover:bg-ink/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1 basis-48">
            Estimated Flagstaff pickup: <strong className="font-semibold">{dateLabel}</strong>
          </span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-muted-foreground">
            Details
            <ChevronDown aria-hidden="true" className="size-4 group-open:rotate-180 motion-safe:transition-transform" />
          </span>
        </summary>
        <div className="space-y-2 px-4 pb-4 pt-4 text-muted-foreground">
          <p><strong className="font-medium">Order processing:</strong> Accepted within 24 hours.</p>
          <p><strong className="font-medium">Timing:</strong> {customSize ? "Custom-size timing is confirmed when your request is accepted." : "Includes material delivery and crafting."}</p>
          <p className="italic">Dates are estimates and may shift due to supplier or holiday delays.</p>
        </div>
      </details>
    </section>
  );
}
