import type { YarnColor } from "@/data/products";
import { getAllYarns, yarnLineName } from "@/data/yarns";
import { sentenceCaseColorName } from "@/lib/color-name";

/** Distinguish duplicate supplier color names without changing canonical names or IDs. */
export function yarnColorLabel(
  yarn: YarnColor,
  catalog: YarnColor[],
  scope: "library" | "catalog" = "library",
): string {
  const color = sentenceCaseColorName(yarn.name);
  // Gallery tags only need to distinguish choices available on the current PDP.
  const allYarns = scope === "catalog" ? catalog : [...getAllYarns(), ...catalog];
  const duplicate = allYarns.some(other => other.id !== yarn.id && other.name.trim().toLowerCase() === yarn.name.trim().toLowerCase());
  if (!duplicate) return color;
  const line = yarnLineName(yarn)?.replace(/[®™]/g, "").replace(/\s+Yarn.*$/i, "").replace(/\s+by Loops & Threads.*$/i, "");
  const label = line ? `${color} · ${line}` : color;
  const sameLineDuplicate = allYarns.some(other => other.id !== yarn.id &&
    sentenceCaseColorName(other.name) === color && yarnLineName(other) === yarnLineName(yarn));
  return sameLineDuplicate ? `${label} · ${yarn.supplierSku ?? yarn.id}` : label;
}
