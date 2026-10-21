import { formatLineOptions } from "@/lib/line-options";

export type OrderLineKind = "catalog" | "pattern_request";

export type OrderLine = {
  kind: OrderLineKind;
  productId: string;
  productName: string;
  sizeId: string;
  sizeLabel: string;
  yarnId: string;
  yarnName: string;
  tagId?: string;
  tagLabel?: string;
  pomPomId?: string;
  pomPomLabel?: string;
  quantity: number;
  unitPrice: number;
  priceTbd?: boolean;
  patternName?: string;
  designerName?: string;
  patternUrl?: string | null;
};

export type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  customerNote?: string;
  venmoHandle?: string;
  pickupPreference?: string;
  lines: OrderLine[];
  total: number;
  status: "new" | "in_progress" | "done";
};

export type AggregatedLine = {
  key: string;
  kind: OrderLineKind;
  productId: string;
  productName: string;
  sizeLabel: string;
  yarnName: string;
  tagLabel?: string;
  pomPomLabel?: string;
  quantity: number;
  patternName?: string;
  designerName?: string;
};

export function formatAggregateLine(line: AggregatedLine): string {
  const opts = formatLineOptions(line);
  const base = `${line.quantity} × ${line.productName} · ${opts}`;
  if (line.kind === "pattern_request" && line.patternName) {
    return `${base} (request · pattern: ${line.patternName})`;
  }
  return base;
}
