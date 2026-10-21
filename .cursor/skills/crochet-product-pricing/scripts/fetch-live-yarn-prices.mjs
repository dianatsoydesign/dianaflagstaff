#!/usr/bin/env node
/**
 * Live yarn prices for pricing reports only — not used by the Looped Local website.
 * Usage: node .cursor/skills/crochet-product-pricing/scripts/fetch-live-yarn-prices.mjs
 */
const MASTER_SKU = "M10133746";
const MICHAELS_API = "https://www.michaels.com/api/product/v2";
const BOBBINY_JSON =
  "https://bobbinycords.us/collections/premium-5mm/products.json?limit=250";
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (compatible; LoopedLocal pricing)",
};

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

function parseCharismaPrice(sub) {
  const ip = sub?.itemPrice ?? {};
  const n = parseFloat(ip.numberPrice);
  if (Number.isFinite(n)) return { priceUsd: n, display: ip.price, orgPrice: ip.orgPrice };
  const m = String(ip.price ?? "").replace(/[^0-9.]/g, "");
  return { priceUsd: parseFloat(m) || null, display: ip.price, orgPrice: ip.orgPrice };
}

async function main() {
  const fetchedAt = new Date().toISOString();
  const [master] = await getJson(
    `${MICHAELS_API}/skus?skuNumbers=${MASTER_SKU}`
  );
  const skus = Object.values(master?.variantSkus ?? {});
  if (!skus.length) throw new Error("Michaels returned no Charisma SKUs");

  const subs = await getJson(
    `${MICHAELS_API}/sub-skus?skuNumbers=${skus[0]}`
  );
  const charismaPrice = parseCharismaPrice(subs[0]);

  const bob = await getJson(BOBBINY_JSON);
  const variants = [];
  for (const p of bob.products ?? []) {
    for (const v of p.variants ?? []) {
      variants.push({
        handle: p.handle,
        title: p.title,
        priceUsd: parseFloat(v.price),
        sku: v.sku,
      });
    }
  }
  variants.sort((a, b) => a.priceUsd - b.priceUsd);
  const mid = variants[Math.floor(variants.length / 2)];

  const payload = {
    fetchedAt,
    charisma: {
      line: "Charisma by Loops & Threads (Michaels)",
      sampleSku: skus[0],
      perSkein: charismaPrice,
      productUrl:
        "https://www.michaels.com/product/charisma-yarn-by-loops-threads-10133751",
      source: "michaels_api",
    },
    bobbiny: {
      line: "Bobbiny Premium 5mm braided cord",
      spoolYards: 108,
      perSpoolUsd: mid?.priceUsd ?? variants[0]?.priceUsd,
      referenceVariant: mid ?? variants[0],
      priceRangeUsd: {
        min: variants[0]?.priceUsd,
        max: variants[variants.length - 1]?.priceUsd,
      },
      collectionUrl: "https://bobbinycords.us/collections/premium-5mm",
      source: "bobbinycords_shopify",
      note: "Bobbiny ≫ Charisma per project; use spool fraction × perSpoolUsd for materials.",
    },
    flagstaffTax: {
      fallbackCombinedRate: 0.09181,
      fallbackSource: "https://azdor.gov/transaction-privilege-tax/tpt-rates",
      note: "Confirm combined Flagstaff retail rate each report run; apply to materials + tag only.",
    },
  };

  console.log(JSON.stringify(payload, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
