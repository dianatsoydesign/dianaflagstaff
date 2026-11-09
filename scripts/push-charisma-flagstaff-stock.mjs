#!/usr/bin/env node
// node scripts/push-charisma-flagstaff-stock.mjs --check-only verifies stock without publishing.
import { readFile, writeFile } from 'node:fs/promises';
import { stockRequest } from './stock-request.mjs';
import { stockRefreshSecret } from '../src/lib/stock-refresh-auth.mjs';
import { FLAGSTAFF_STORE_ID, minimumForHatSku, pickupQuantities } from '../src/lib/charisma-inventory.mjs';

const checkOnly = process.argv.includes('--check-only');
const writeBootstrap = process.argv.includes('--write-bootstrap');
if (writeBootstrap && !checkOnly) throw new Error('Use --check-only when writing bootstrap stock');
const siteUrl = process.env.SITE_URL || 'https://dianaflagstaff.com';
const secret = stockRefreshSecret(process.env, 'CHARISMA_STOCK_SECRET');
if (!checkOnly && !secret) throw new Error('Set STOCK_REFRESH_SECRET (or CHARISMA_STOCK_SECRET) before publishing stock');
if (!checkOnly && new URL(siteUrl).protocol !== 'https:') throw new Error('SITE_URL must use HTTPS');
const baseCatalog = JSON.parse(await readFile(new URL('../src/data/charisma.json', import.meta.url), 'utf8'));
const { MICHAELS_FLAGSTAFF_CATALOG } = await import('../src/data/michaels-hat-catalog.mjs');
const skus = [...new Set(MICHAELS_FLAGSTAFF_CATALOG.map(yarn => {
  if (!/^michaels:\d+$/.test(yarn.supplierSku)) throw new Error('Invalid Charisma SKU');
  return yarn.supplierSku.split(':')[1];
}))];
if (!skus.length) throw new Error('Empty Charisma catalog');

const checkedAt = Date.now();
const quantities = {};
for (let offset = 0; offset < skus.length; offset += 25) {
  const batch = skus.slice(offset, offset + 25);
  const query = new URLSearchParams({ skuNumbers: batch.join(','), michaelsStoreId: FLAGSTAFF_STORE_ID, fields: 'inventory', source: 'pdpPage' });
  const rows = await stockRequest(`https://www.michaels.com/api/product/v2/sub-skus?${query}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' },
  }, { service: 'Michaels inventory' });
  Object.assign(quantities, pickupQuantities(rows, batch));
}
const snapshot = { storeId: FLAGSTAFF_STORE_ID, checkedAt, quantities };
console.log(`Checked ${skus.length} colors at Flagstaff #${FLAGSTAFF_STORE_ID}; ${Object.entries(quantities).filter(([sku, qty]) => qty !== null && qty >= minimumForHatSku(sku)).length} qualify for hats and headbands (per-line stock minimum), ${baseCatalog.yarns.filter(yarn => (quantities[yarn.supplierSku.split(":")[1]] ?? 0) >= 3).length} qualify for stockings (3+ skeins); ${Object.values(quantities).filter(qty => qty === null).length} have no verified pickup count and stay hidden.`);
if (writeBootstrap) {
  await writeFile(new URL('../src/data/charisma-stock-bootstrap.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
  console.log('Initial verified stock snapshot saved.');
}
if (!checkOnly) {
  const saved = await stockRequest(`${siteUrl.replace(/\/$/, '')}/api/cron/charisma-flagstaff-stock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot),
  }, { service: 'Website stock save' });
  if (saved?.ok !== true) throw new Error('Website did not confirm saved stock');
  console.log('Flagstaff stock saved successfully.');
}
