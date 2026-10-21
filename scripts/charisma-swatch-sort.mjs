/**
 * Charisma swatch sort from cropped RGB pixels (same crop as sync-charisma.mjs).
 * Solids: greens first (pixel hues), then other hues, then neutrals. Multicolors always last.
 */

export function hsl([r, g, b]) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === rn) h = ((gn - bn) / d) % 6;
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
}

function readPixels(sharp, swatchBuffer, size = 32) {
  return sharp(swatchBuffer)
    .resize(size, size)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data }) => {
      const px = [];
      for (let i = 0; i < data.length; i += 3) {
        px.push([data[i], data[i + 1], data[i + 2]]);
      }
      return px;
    });
}

function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[s.length >> 1];
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** How spread out hues are on the swatch (degrees, 0–180). */
function hueSpread(hues) {
  if (hues.length < 2) return 0;
  const xs = hues.map((h) => h * (Math.PI / 180));
  const cx = mean(xs.map(Math.cos));
  const sx = mean(xs.map(Math.sin));
  const R = Math.hypot(cx, sx);
  return (Math.acos(Math.min(1, R)) * 180) / Math.PI;
}

/**
 * Multicolor = pixel median differs from many neighbors in hue or RGB,
 * or chromatic pixels span a wide hue arc (pale variegated).
 */
export function multicolorFromPixels(pixels) {
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const chroma = (p) => {
    const sum = p[0] + p[1] + p[2] + 1;
    return p.map((v) => (v / sum) * 255);
  };
  const med = [0, 1, 2].map((c) =>
    pixels.map((p) => p[c]).sort((a, b) => a - b)[pixels.length >> 1]
  );
  const hueOff =
    pixels.filter((p) => dist(chroma(p), chroma(med)) > 18).length / pixels.length;
  const colorOff = pixels.filter((p) => dist(p, med) > 70).length / pixels.length;

  const chromatic = pixels
    .map((p) => hsl(p))
    .filter(({ s, l }) => s >= 0.12 && l >= 0.12 && l <= 0.94);
  const spread = hueSpread(chromatic.map((c) => c.h));

  const hslPx = pixels.map((p) => hsl(p));
  const meanL = mean(hslPx.map((c) => c.l));
  const stdL = Math.sqrt(
    mean(hslPx.map((c) => (c.l - meanL) ** 2))
  );
  // Pale variegated (e.g. white base + faint flecks): low colorOff but visible lightness variation.
  const paleVariegated =
    meanL > 0.78 && colorOff > 0.045 && stdL > 0.065;

  return (
    hueOff > 0.3 ||
    colorOff > 0.2 ||
    (chromatic.length >= 8 && spread > 42) ||
    paleVariegated
  );
}

export async function isMulticolor(sharp, swatchBuffer) {
  const pixels = await readPixels(sharp, swatchBuffer);
  return multicolorFromPixels(pixels);
}

function isNeutralHsl({ s, l }) {
  return s < 0.15 || l < 0.12 || l > 0.94;
}

function isGreenHue(h) {
  return h >= 55 && h <= 170;
}

/** Grey, black, and white solids (high lightness / low saturation on the crop). */
function solidNeutralSwatch(hslPx, pixels) {
  const meanL = mean(hslPx.map((c) => c.l));
  const meanS = mean(hslPx.map((c) => c.s));
  const neutralShare =
    hslPx.filter((c) => isNeutralHsl(c)).length / pixels.length;
  if (meanL > 0.82 && meanS < 0.22 && neutralShare >= 0.45) return true;
  // Off-white / white crops can read warm and saturated on the label crop.
  const chromatic = hslPx.filter((c) => c.s > 0.1);
  if (meanL > 0.84 && meanS < 0.42 && chromatic.length > 0) {
    const meanHue = mean(chromatic.map((c) => c.h));
    if (meanHue > 35 && meanHue < 95) return true;
  }
  return false;
}

/** Lower sortRank appears first. Multicolors use 2000+. */
export function computeSortRankFromPixels(pixels, multicolor) {
  if (multicolor) {
    const chromatic = pixels
      .map((p) => hsl(p))
      .filter(({ s, l }) => s >= 0.12 && l >= 0.12 && l <= 0.94);
    const tie =
      chromatic.length > 0
        ? mean(chromatic.map((c) => c.h))
        : mean(pixels.map((p) => hsl(p).l)) * 100;
    return 2000 + tie;
  }

  const hslPx = pixels.map((p) => hsl(p));
  if (solidNeutralSwatch(hslPx, pixels)) {
    return 1000 + mean(hslPx.map((c) => c.l)) * 100;
  }
  const chromatic = hslPx.filter((c) => !isNeutralHsl(c));
  const greenHues = hslPx
    .filter(
      (c) => c.s >= 0.06 && c.l >= 0.08 && c.l <= 0.94 && isGreenHue(c.h)
    )
    .map((c) => c.h);

  const meanL = mean(hslPx.map((c) => c.l));
  const greenShare = greenHues.length / Math.max(chromatic.length, 1);

  // Green yarns often have a dark/neutral label crop; still group by green pixels.
  if (
    greenHues.length >= 8 &&
    greenHues.length / pixels.length >= 0.006 &&
    (meanL < 0.75 || greenShare >= 0.2)
  ) {
    return mean(greenHues);
  }

  if (chromatic.length < pixels.length * 0.2) {
    return 1000 + mean(hslPx.map((c) => c.l)) * 100;
  }

  const hues = chromatic.map((c) => c.h);
  let hue = mean(hues);
  if (hue >= 345) hue -= 360;
  return 200 + (hue < 0 ? hue + 360 : hue);
}

/** Family id for picker chips (derived from sortRank tiers, not color names). */
export function computeColorGroupId(multicolor, sortRank) {
  if (multicolor || sortRank >= 2000) return "multis";
  if (sortRank >= 1000) {
    if (sortRank >= 1035 || sortRank <= 1012) return "neutrals";
    return "browns";
  }
  if (sortRank < 171) return "greens";
  let hue = sortRank - 200;
  if (hue < 0) hue += 360;
  if (hue >= 345 || hue < 25) return "reds";
  if (hue < 70) return "yellows";
  if (hue < 170) return "greens";
  if (hue < 265) return "blues";
  if (hue < 300) return "purples";
  return "pinks";
}

/** Pixel analysis → multicolor flag + picker sort rank + family group. */
export async function analyzeSwatch(sharp, swatchBuffer) {
  const pixels = await readPixels(sharp, swatchBuffer);
  const multicolor = multicolorFromPixels(pixels);
  const sortRank = computeSortRankFromPixels(pixels, multicolor);
  const colorGroup = computeColorGroupId(multicolor, sortRank);
  return { multicolor, sortRank, colorGroup };
}

/** @deprecated use analyzeSwatch */
export function computeSortRank(hslColor, multicolor) {
  const { h, s, l } = hslColor;
  if (multicolor) return 2000 + h;
  if (isNeutralHsl({ s, l })) return 1000 + l * 100;
  if (isGreenHue(h) && s >= 0.15) return h;
  const hue = h < 345 ? h : h - 360;
  return 200 + (hue < 0 ? hue + 360 : hue);
}
