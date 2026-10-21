#!/usr/bin/env node
/**
 * Refresh src/data/bobbiny-premium-5mm.json from Bobbiny's Premium 5mm collection.
 * Keeps only variants that are in stock at bobbinycords.us.
 *
 * Each color's images are classified by their pixels, not their position:
 *   - generic: same shape + color as images on several other colors
 *     (caution outline, size chart) :  dropped
 *   - spool:   the whole yarn on a white background :  sets the reference color
 *   - closeup: frame-filling texture in the reference color
 *   - other:   kept only if enough of it shows the reference color
 * Gallery order: best close-up, spool, then other color-matching shots : 
 * except framed swatch-card close-ups, which go after the spool.
 *
 * Writes /tmp/bobbiny-color-images.jpg as a contact sheet for spot-checking.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const COLLECTION_JSON =
  "https://bobbinycords.us/collections/premium-5mm/products.json?limit=250";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = join(root, "src/data/bobbiny-premium-5mm.json");
/** Same matte as product photos (src/lib/product-photo-bg.ts). */
const MATTE = "#f3efe8";
const SAMPLE = 48;
const MAX_COLOR_IMAGES = 6;
// Store-wide graphics repeat on 30+ colors; similar pale spools only match a handful.
const GENERIC_MIN_OTHER_COLORS = 10;
const MIN_OTHER_MATCH = 0.3;

const toUrl = (src, width) =>
  src ? `${src.split("?")[0]}?width=${width}` : "";

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
// Bobbiny shoots on pure white; a looser cutoff swallows pale cords like Off White.
const isBackground = ([r, g, b]) =>
  Math.min(r, g, b) > 240 && Math.max(r, g, b) - Math.min(r, g, b) < 12;

function median(pixels) {
  if (!pixels.length) return [255, 255, 255];
  return [0, 1, 2].map((c) => {
    const v = pixels.map((p) => p[c]).sort((a, b) => a - b);
    return v[v.length >> 1];
  });
}

async function analyze(src) {
  const res = await fetch(toUrl(src, 200));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const base = sharp(buf).flatten({ background: MATTE });

  const { data } = await base
    .clone()
    .resize(SAMPLE, SAMPLE, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = [];
  for (let i = 0; i < data.length; i += 3)
    pixels.push([data[i], data[i + 1], data[i + 2]]);

  const content = [];
  let minX = SAMPLE, minY = SAMPLE, maxX = -1, maxY = -1;
  pixels.forEach((p, i) => {
    if (isBackground(p)) return;
    content.push(p);
    const x = i % SAMPLE, y = Math.floor(i / SAMPLE);
    minX = Math.min(minX, x); maxX = Math.max(maxX, x);
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  });
  const boxArea = maxX < 0 ? 1 : (maxX - minX + 1) * (maxY - minY + 1);
  const med = median(content);

  // Braided close-ups have strong pixel-to-pixel variation across the cord.
  const lum = ([r, g, b]) => 0.3 * r + 0.59 * g + 0.11 * b;
  let texSum = 0, texPairs = 0;
  for (let y = 0; y < SAMPLE; y++) {
    for (let x = 1; x < SAMPLE; x++) {
      const a = pixels[y * SAMPLE + x - 1], b = pixels[y * SAMPLE + x];
      if (isBackground(a) || isBackground(b)) continue;
      texSum += Math.abs(lum(a) - lum(b));
      texPairs += 1;
    }
  }

  const { data: grey } = await base
    .clone()
    .greyscale()
    .resize(8, 8, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const avg = grey.reduce((a, b) => a + b, 0) / grey.length;

  return {
    src,
    content,
    whiteFrac: 1 - content.length / pixels.length,
    solidity: content.length / boxArea,
    dominance: content.length
      ? content.filter((p) => dist(p, med) < 45).length / content.length
      : 0,
    med,
    texture: texPairs ? texSum / texPairs : 0,
    hash: [...grey].map((v) => (v > avg ? 1 : 0)),
  };
}

const hamming = (a, b) => a.reduce((n, bit, i) => n + (bit !== b[i] ? 1 : 0), 0);

function matchFraction(img, ref) {
  if (!img.content.length) return 0;
  return img.content.filter((p) => dist(p, ref) < 50).length / img.content.length;
}

const isSpoolShape = (img) =>
  img.whiteFrac >= 0.35 &&
  img.whiteFrac <= 0.68 &&
  img.solidity >= 0.5 &&
  img.solidity <= 0.7 &&
  img.dominance >= 0.6;

function pickColorImages(images) {
  const usable = images.filter((img) => !img.generic);
  if (!usable.length) return [];

  const spool = usable.find(isSpoolShape) ?? null;
  const ref = spool
    ? spool.med
    : [...usable].sort((a, b) => b.dominance - a.dominance)[0].med;

  // Two kinds of close-up: a full-frame braid texture, or a framed swatch square.
  const closeupScore = (img) => {
    if (img === spool || dist(img.med, ref) >= 60) return 0;
    if (img.texture >= 22 && img.whiteFrac < 0.35 && img.dominance >= 0.4)
      return img.texture;
    if (img.solidity >= 0.68 && img.dominance >= 0.7) return 25 * img.dominance;
    return 0;
  };
  const closeup =
    usable
      .map((img) => ({ img, score: closeupScore(img) - img.pos * 2 }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)[0]?.img ?? null;

  const others = usable
    .filter((img) => img !== spool && img !== closeup)
    .map((img) => ({ img, match: matchFraction(img, ref) }))
    .filter(({ match }) => match >= MIN_OTHER_MATCH)
    .sort((a, b) => b.match - a.match)
    .map(({ img }) => img);

  // Framed swatch squares sit on a mostly white card; the spool makes a better lead image.
  const framedSwatch = closeup && closeup.whiteFrac >= 0.45 && closeup.solidity < 0.76;
  const lead = framedSwatch ? [spool, closeup] : [closeup, spool];

  return [...lead, ...others]
    .filter(Boolean)
    .slice(0, MAX_COLOR_IMAGES)
    .map((img) => img.src);
}

const res = await fetch(COLLECTION_JSON);
if (!res.ok) {
  console.error("Fetch failed", res.status);
  process.exit(1);
}

const data = await res.json();
const inStock = data.products.filter((p) =>
  p.variants.some((v) => v.available)
);

const analyzed = [];
for (const p of inStock) {
  const images = [];
  for (const im of p.images ?? []) {
    try {
      images.push({ ...(await analyze(im.src)), pos: im.position });
    } catch (err) {
      console.warn(`  skip ${p.title} image ${im.position}: ${err.message}`);
    }
  }
  analyzed.push({ product: p, images });
}

for (const { product, images } of analyzed) {
  for (const img of images) {
    const sharedWith = analyzed.filter(
      (other) =>
        other.product.id !== product.id &&
        other.images.some(
          (o) => hamming(o.hash, img.hash) <= 6 && dist(o.med, img.med) < 25
        )
    ).length;
    img.generic = sharedWith >= GENERIC_MIN_OTHER_COLORS;
  }
}

const yarns = [];
for (const { product: p, images } of analyzed) {
  const suffix = p.handle
    .replace(/^bobbiny-premium-5mm-braided-rope-/, "")
    .replace(/^leopard-braided-5mm$/, "leopard")
    .replace(/^nut-brown-5mm-braided$/, "nut-brown")
    .replace(/^ink-blue-5mm-braided$/, "ink-blue")
    .replace(/^moss-green-5mm-braided$/, "moss-green")
    .replace(/^pale-olive-braided-5mm$/, "pale-olive");

  if (process.env.DEBUG && p.title.match(new RegExp(process.env.DEBUG, "i"))) {
    for (const img of images)
      console.log(
        `  #${img.pos} generic=${img.generic} white=${img.whiteFrac.toFixed(2)} solid=${img.solidity.toFixed(2)} dom=${img.dominance.toFixed(2)} tex=${img.texture.toFixed(1)} med=${img.med}`
      );
  }
  const picked = pickColorImages(images);
  const colorImages = picked.length ? picked : [p.images?.[0]?.src ?? ""];
  console.log(
    `${p.title.padEnd(22)} ${colorImages.length} image(s): positions ${colorImages
      .map((src) => images.find((i) => i.src === src)?.pos ?? 1)
      .join(", ")}`
  );

  yarns.push({
    id: `bobbiny-5mm-${suffix}`,
    name: p.title,
    swatchSrc: toUrl(colorImages[0], 240),
    detailSwatchSrc: toUrl(colorImages[0], 1400),
    colorImages: colorImages.map((src) => toUrl(src, 1400)),
    supplierSku: `bobbiny:${p.handle}`,
    stockStatus: "in_stock",
  });
}

const payload = {
  syncedAt: new Date().toISOString(),
  collectionUrl: "https://bobbinycords.us/collections/premium-5mm",
  yarns,
};

writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${yarns.length} in-stock colors to ${outPath}`);

const TILE = 110;
const cols = MAX_COLOR_IMAGES + 1;
const composites = [];
for (const [row, yarn] of yarns.entries()) {
  const label = Buffer.from(
    `<svg width="${TILE}" height="${TILE}"><text x="4" y="${TILE / 2}" font-size="13" font-family="sans-serif">${yarn.name}</text></svg>`
  );
  composites.push({ input: label, left: 0, top: row * TILE });
  for (const [col, src] of yarn.colorImages.entries()) {
    const tile = await sharp(
      Buffer.from(await (await fetch(toUrl(src, 200))).arrayBuffer())
    )
      .flatten({ background: MATTE })
      .resize(TILE - 6, TILE - 6, { fit: "cover" })
      .toBuffer();
    composites.push({ input: tile, left: (col + 1) * TILE, top: row * TILE + 3 });
  }
}
await sharp({
  create: { width: cols * TILE, height: yarns.length * TILE, channels: 3, background: "#fff" },
})
  .composite(composites)
  .jpeg({ quality: 70 })
  .toFile("/tmp/bobbiny-color-images.jpg");
console.log("Contact sheet: /tmp/bobbiny-color-images.jpg");

await import("./build-yarn-thumbs.mjs");
