#!/usr/bin/env node
/**
 * Refresh src/data/charisma.json from Michaels' Charisma® Yarn by Loops & Threads®:
 * https://www.michaels.com/product/charisma-yarn-by-loops-threads-10133751
 *
 * Michaels' product pages block scripts, but the JSON endpoints its own
 * frontend calls do not:
 *   - /api/product/v2/skus?skuNumbers=<master>      → every color → SKU
 *   - /api/product/v2/sub-skus?skuNumbers=<skus>    → per-color photos + online stock
 *
 * All colors are kept; the hourly live check hides out-of-stock ones in the shop.
 *
 * Each color's picker swatch is cropped from the yarn to the left of the
 * skein label in Michaels' hero photo (their own swatch images are 60px).
 * sortRank / multicolor on each yarn come from that crop’s pixels (see
 * charisma-swatch-sort.mjs): greens first among solids, neutrals, then multis.
 *
 * Writes /tmp/charisma-swatches.jpg as a contact sheet for spot-checking.
 */
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { analyzeSwatch } from "./charisma-swatch-sort.mjs";
import charismaGroupOverrides from "../src/data/charisma-group-overrides.json" with {
  type: "json",
};

const MASTER_SKU = "M10133746";
const API = "https://www.michaels.com/api/product/v2";
const HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src/data/charisma.json");
const swatchDir = join(root, "public/yarn-swatches/charisma");
// Transparent-background copies made by scripts/charisma-transparent.py, named by Michaels image ID.
const photoDir = join(root, "public/yarn-images/charisma");

const SWATCH_PX = 240;
// Hero shots are a centered skein with a paper label; this box sits on the yarn left of it.
const CROP = { left: 0.19, top: 0.42, size: 0.155 };

const imageUrl = (url, size) =>
  `${url.split("?")[0]}?fit=inside|${size}:${size}`;

const photoId = (url) => url.split("?")[0].split("/").pop().replace(/\.[a-z]+$/i, "");

/** Local transparent copy when we already have one; otherwise the Michaels URL. */
const photoSrc = (url) =>
  existsSync(join(photoDir, `${photoId(url)}.webp`))
    ? `/yarn-images/charisma/${photoId(url)}.webp`
    : imageUrl(url, 1400);

const slug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

const [master] = await getJson(`${API}/skus?skuNumbers=${MASTER_SKU}`);
const skus = Object.values(master.variantSkus ?? {});
if (!skus.length) {
  console.error("No color variants found for", MASTER_SKU);
  process.exit(1);
}
const subs = await getJson(`${API}/sub-skus?skuNumbers=${skus.join(",")}`);

mkdirSync(swatchDir, { recursive: true });

const yarns = [];
for (const sub of subs) {
  const name = (sub.variantAttr ?? "").replace(/^\d+:\s*/, "").trim();
  const photos = (sub.media ?? [])
    .filter((m) => m.mediaType === 0 && m.fullSizeUrl)
    .sort((a, b) => a.sort - b.sort)
    .map((m) => m.fullSizeUrl);
  if (!name || !photos.length) {
    console.warn(`  skip ${sub.skuNumber}: missing color name or photo`);
    continue;
  }

  const id = `charisma-${slug(name)}`;
  const hero = Buffer.from(
    await (await fetch(imageUrl(photos[0], 1400), { headers: HEADERS })).arrayBuffer()
  );
  const { width = 1400, height = 1400 } = await sharp(hero).metadata();
  const side = Math.round(CROP.size * width);
  const crop = sharp(hero).extract({
    left: Math.round(CROP.left * width),
    top: Math.round(CROP.top * height),
    width: side,
    height: side,
  });
  const swatch = await crop
    .trim({ threshold: 25 })
    .resize(SWATCH_PX, SWATCH_PX, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();
  writeFileSync(join(swatchDir, `${id}.webp`), swatch);
  const { multicolor, sortRank, colorGroup } = await analyzeSwatch(sharp, swatch);
  const group = charismaGroupOverrides[id] ?? colorGroup;

  yarns.push({
    yarn: {
      id,
      name,
      swatchSrc: `/yarn-swatches/charisma/${id}.webp`,
      colorImages: photos.map(photoSrc),
      supplierSku: `michaels:${sub.skuNumber}`,
      stockStatus: sub.inventoryMcu?.inStock ? "in_stock" : "out_of_stock",
      multicolor,
      sortRank,
      colorGroup: group,
    },
    sortRank,
  });
  console.log(
    `${name.padEnd(22)} ${sub.skuNumber}  ${sub.inventoryMcu?.inStock ? "in stock" : "OUT"}  ${photos.length} photo(s)${multicolor ? "  multicolor" : ""}`
  );
}

yarns.sort((a, b) => a.sortRank - b.sortRank);

const payload = {
  syncedAt: new Date().toISOString(),
  productUrl:
    "https://www.michaels.com/product/charisma-yarn-by-loops-threads-10133751",
  masterSku: MASTER_SKU,
  yarns: yarns.map((y) => y.yarn),
};
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${yarns.length} colors to ${outPath}`);

const allPhotos = payload.yarns.flatMap((y) => y.colorImages);
const newPhotos = allPhotos.filter((src) => src.startsWith("http")).length;
if (newPhotos) {
  console.log(
    `${newPhotos} new photo(s) from Michaels. Make them transparent with:\n` +
      "  source ~/.rembg-venv/bin/activate && python scripts/charisma-transparent.py"
  );
}

// Drop stored photos Michaels no longer uses (e.g. discontinued colors).
const inUse = new Set(allPhotos.map((src) => src.split("/").pop()));
if (existsSync(photoDir)) {
  for (const file of readdirSync(photoDir)) {
    if (!inUse.has(file)) {
      unlinkSync(join(photoDir, file));
      console.log(`  removed unused photo ${file}`);
    }
  }
}

const TILE = 120;
const cols = 8;
const rows = Math.ceil(yarns.length / cols);
const composites = [];
for (const [i, { yarn }] of yarns.entries()) {
  const left = (i % cols) * TILE, top = Math.floor(i / cols) * TILE;
  composites.push({
    input: await sharp(join(swatchDir, `${yarn.id}.webp`)).resize(TILE - 24, TILE - 24).toBuffer(),
    left: left + 12,
    top: top + 2,
  });
  composites.push({
    input: Buffer.from(
      `<svg width="${TILE}" height="20"><text x="${TILE / 2}" y="14" font-size="11" text-anchor="middle" font-family="sans-serif">${yarn.name}</text></svg>`
    ),
    left,
    top: top + TILE - 20,
  });
}
await sharp({
  create: { width: cols * TILE, height: rows * TILE, channels: 3, background: "#fff" },
})
  .composite(composites)
  .jpeg({ quality: 75 })
  .toFile("/tmp/charisma-swatches.jpg");
console.log("Contact sheet: /tmp/charisma-swatches.jpg");
