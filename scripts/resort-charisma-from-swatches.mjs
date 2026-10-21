#!/usr/bin/env node
/**
 * Recompute Charisma sortRank + multicolor from local swatch WebPs (pixel-based).
 * Use after pulling charisma.json or when swatches change without re-syncing Michaels.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { analyzeSwatch } from "./charisma-swatch-sort.mjs";
import charismaGroupOverrides from "../src/data/charisma-group-overrides.json" with {
  type: "json",
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src/data/charisma.json");
const payload = JSON.parse(readFileSync(outPath, "utf8"));

for (const yarn of payload.yarns) {
  const swatchPath = join(root, "public", yarn.swatchSrc);
  const swatch = readFileSync(swatchPath);
  const { multicolor, sortRank, colorGroup } = await analyzeSwatch(sharp, swatch);
  yarn.multicolor = multicolor;
  yarn.sortRank = sortRank;
  yarn.colorGroup = charismaGroupOverrides[yarn.id] ?? colorGroup;
}

payload.yarns.sort((a, b) => a.sortRank - b.sortRank);
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(
  `Updated sortRank for ${payload.yarns.length} colors (${payload.yarns.filter((y) => y.multicolor).length} multicolor)`
);
