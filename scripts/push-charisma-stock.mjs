#!/usr/bin/env node
/**
 * Check Charisma stock at Michaels and send it to the live site.
 *
 * Michaels blocks requests from Cloudflare, but not from a home connection,
 * so this runs hourly on Diana's Mac (see scripts/install-charisma-push.sh).
 *
 * Required env vars:
 *   SITE_URL     :  e.g. https://diana-flagstaff.dianatsoydesign.workers.dev
 *   CRON_SECRET  :  matches the CRON_SECRET secret on the Worker
 */

const MASTER_SKU = "M10133746";
const API = "https://www.michaels.com/api/product/v2";
const HEADERS = {
  Accept: "application/json",
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};

const { SITE_URL, CRON_SECRET } = process.env;
if (!SITE_URL || !CRON_SECRET) {
  console.error("SITE_URL and CRON_SECRET are required");
  process.exit(1);
}

async function getJson(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.json();
}

const stamp = new Date().toISOString();
try {
  const [master] = await getJson(`${API}/skus?skuNumbers=${MASTER_SKU}`);
  const skus = Object.values(master?.variantSkus ?? {});
  if (!skus.length) throw new Error("Michaels returned no Charisma colors");

  const subs = await getJson(`${API}/sub-skus?skuNumbers=${skus.join(",")}`);
  const inStockBySku = Object.fromEntries(
    subs.map((s) => [s.skuNumber, Boolean(s.inventoryMcu?.inStock)])
  );

  const res = await fetch(`${SITE_URL.replace(/\/$/, "")}/api/cron/charisma-stock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CRON_SECRET}`,
    },
    body: JSON.stringify({ inStockBySku }),
  });
  const body = await res.text();
  console.log(`${stamp} site → HTTP ${res.status} ${body}`);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error(`${stamp} ${err instanceof Error ? err.message : err}`);
  process.exit(1);
}
