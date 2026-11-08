import type { YarnColor } from "@/data/products";
import { yarnLineName } from "@/data/yarns";
import { sentenceCaseColorName } from "@/lib/color-name";

/** Distinguish duplicate supplier color names without changing canonical names or IDs. */
export function yarnColorLabel(yarn: YarnColor, catalog: YarnColor[]): string {
  const color = sentenceCaseColorName(yarn.name);
  const duplicate = catalog.some(other => other.id !== yarn.id && other.name.trim().toLowerCase() === yarn.name.trim().toLowerCase());
  if (!duplicate) return color;
  const line = yarnLineName(yarn)?.replace(/[®™]/g, "").replace(/\s+Yarn.*$/i, "").replace(/\s+by Loops & Threads.*$/i, "");
  return line ? `${color} · ${line}` : color;
}
