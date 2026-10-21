#!/usr/bin/env node
/**
 * Build circular-thumbnail crops for Bobbiny colors.
 * Full-bleed braid photos are used as-is. Whole-skein photos are zoomed
 * into the cord so every swatch looks like the same close-up.
 */
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
  readFileSync(join(root, "src/data/bobbiny-premium-5mm.json"), "utf8")
);
const outDir = join(root, "public/yarn-swatches/bobbiny");
mkdirSync(outDir, { recursive: true });

/** Same matte as product cards / Charisma gallery (src/lib/product-photo-bg.ts). */
const MATTE = "#f3efe8";

const paper = (r, g, b) => r > 246 && g > 246 && b > 246;

async function load(buf) {
  const meta = await sharp(buf).metadata();
  const maxDim = 220;
  const scale = Math.min(1, maxDim / Math.max(meta.width, meta.height));
  const w = Math.max(1, Math.round(meta.width * scale));
  const h = Math.max(1, Math.round(meta.height * scale));
  const { data } = await sharp(buf)
    .flatten({ background: MATTE })
    .removeAlpha()
    .resize(w, h, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const at = (x, y) => {
    const i = (y * w + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const bgAt = (x, y) => {
    const [r, g, b] = at(x, y);
    return paper(r, g, b);
  };
  const lum = (x, y) => {
    const [r, g, b] = at(x, y);
    return 0.3 * r + 0.59 * g + 0.11 * b;
  };
  let edgePaper = 0;
  let edgeN = 0;
  for (let x = 0; x < w; x += 2) {
    edgeN += 2;
    if (bgAt(x, 0)) edgePaper++;
    if (bgAt(x, h - 1)) edgePaper++;
  }
  for (let y = 0; y < h; y += 2) {
    edgeN += 2;
    if (bgAt(0, y)) edgePaper++;
    if (bgAt(w - 1, y)) edgePaper++;
  }
  return { meta, scale, w, h, bgAt, lum, fullBleed: edgePaper / edgeN < 0.08 };
}

function searchCrop(a) {
  const { w, h, bgAt, lum } = a;
  const minSide = Math.min(w, h);
  const sizes = [0.34, 0.42, 0.52, 0.64].map((f) =>
    Math.max(18, Math.round(minSide * f))
  );
  let best = null;
  for (const side of sizes) {
    if (side > w || side > h) continue;
    const step = Math.max(2, Math.round(side / 10));
    for (let y = 0; y + side <= h; y += step) {
      for (let x = 0; x + side <= w; x += step) {
        const cx = x + side / 2;
        const cy = y + side / 2;
        if (cx > w * 0.7 && cy > h * 0.6) continue;
        let paperCount = 0;
        let tex = 0;
        let n = 0;
        for (let py = y; py < y + side; py += 2) {
          for (let px = x; px < x + side; px += 2) {
            if (bgAt(px, py)) paperCount++;
            if (px + 2 < x + side) {
              tex += Math.abs(lum(px, py) - lum(Math.min(w - 1, px + 2), py));
              n++;
            }
          }
        }
        if (paperCount > 0 || !n) continue;
        const texAvg = tex / n;
        const cover = side / minSide;
        const lower = cy > h * 0.52 ? 1.15 : 0.8;
        const score = texAvg * cover * cover * lower;
        if (!best || score > best.score) best = { x, y, side, cover, texAvg };
      }
    }
  }
  return best;
}

async function cropOf(buf) {
  const a = await load(buf);
  if (a.fullBleed) {
    const side = Math.min(a.meta.width, a.meta.height);
    return {
      left: Math.floor((a.meta.width - side) / 2),
      top: Math.floor((a.meta.height - side) / 2),
      width: side,
      height: side,
    };
  }
  const best = searchCrop(a);
  if (!best) {
    const side = Math.min(a.meta.width, a.meta.height);
    return {
      left: Math.floor((a.meta.width - side) / 2),
      top: Math.floor((a.meta.height - side) / 2),
      width: side,
      height: side,
      kind: "fallback",
    };
  }
  let left = Math.round(best.x / a.scale);
  let top = Math.round(best.y / a.scale);
  let size = Math.round(best.side / a.scale);
  left = Math.max(0, Math.min(left, a.meta.width - 1));
  top = Math.max(0, Math.min(top, a.meta.height - 1));
  size = Math.max(1, Math.min(size, a.meta.width - left, a.meta.height - top));
  return { left, top, width: size, height: size, kind: "zoom" };
}

const sheetTiles = [];
const TILE = 120;
for (let i = 0; i < catalog.yarns.length; i++) {
  const yarn = catalog.yarns[i];
  const res = await fetch(yarn.detailSwatchSrc);
  if (!res.ok) throw new Error(`${yarn.name} ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const crop = await cropOf(buf);
  if (crop.kind === "fallback") console.log("fallback", yarn.name);
  const thumb = await sharp(buf)
    .extract({
      left: crop.left,
      top: crop.top,
      width: crop.width,
      height: crop.height,
    })
    .resize(192, 192)
    .webp({ quality: 82 })
    .toBuffer();
  await sharp(thumb).toFile(join(outDir, `${yarn.id}.webp`));
  sheetTiles.push({
    input: await sharp(thumb).resize(TILE, TILE).jpeg().toBuffer(),
    left: (i % 8) * TILE,
    top: Math.floor(i / 8) * TILE,
  });
}

const rows = Math.ceil(catalog.yarns.length / 8);
await sharp({
  create: {
    width: 8 * TILE,
    height: rows * TILE,
    channels: 3,
    background: "#ccc",
  },
})
  .composite(sheetTiles)
  .jpeg({ quality: 82 })
  .toFile("/tmp/yarn-thumbs-sheet.jpg");

console.log(`Wrote ${catalog.yarns.length} thumbnails to ${outDir}`);
