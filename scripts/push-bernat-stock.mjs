#!/usr/bin/env node
// node scripts/push-bernat-stock.mjs --check-only verifies stock without publishing.
import { readFile, writeFile } from 'node:fs/promises';
import { FLAGSTAFF_STORE_ID, MIN_SKEINS, pickupQuantities } from '../src/lib/bernat-inventory.mjs';

const checkOnly = process.argv.includes('--check-only');
const writeBootstrap = process.argv.includes('--write-bootstrap');
if (writeBootstrap && !checkOnly) throw new Error('Use --check-only when writing bootstrap stock');
const siteUrl = process.env.SITE_URL || 'https://dianaflagstaff.com';
const secret = process.env.BERNAT_STOCK_SECRET;
if (!checkOnly && !secret) throw new Error('Set BERNAT_STOCK_SECRET before publishing stock');
if (!checkOnly && new URL(siteUrl).protocol !== 'https:') throw new Error('SITE_URL must use HTTPS');
const catalog = JSON.parse(await readFile(new URL('../src/data/bernat-blanket-big.json', import.meta.url), 'utf8'));
const skus = [...new Set(catalog.yarns.map(yarn => {
  if (!/^michaels-bernat:\d+$/.test(yarn.supplierSku)) throw new Error('Invalid Bernat SKU');
  return yarn.supplierSku.split(':')[1];
}))];
if (!skus.length) throw new Error('Empty Bernat catalog');

async function request(url, options = {}) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
    }
  }
}

const checkedAt = Date.now();
const quantities = {};
for (let offset = 0; offset < skus.length; offset += 25) {
  const batch = skus.slice(offset, offset + 25);
  const query = new URLSearchParams({ skuNumbers: batch.join(','), michaelsStoreId: FLAGSTAFF_STORE_ID, fields: 'inventory', source: 'pdpPage' });
  const rows = await request(`https://www.michaels.com/api/product/v2/sub-skus?${query}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' },
  });
  Object.assign(quantities, pickupQuantities(rows, batch));
}
const snapshot = { storeId: FLAGSTAFF_STORE_ID, checkedAt, quantities };
console.log(`Checked ${skus.length} colors at Flagstaff #${FLAGSTAFF_STORE_ID}; ${Object.values(quantities).filter(qty => qty !== null && qty >= MIN_SKEINS).length} have at least ${MIN_SKEINS} skeins; ${Object.values(quantities).filter(qty => qty === null).length} have no verified pickup count and stay hidden.`);
if (writeBootstrap) {
  await writeFile(new URL('../src/data/bernat-stock-bootstrap.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
  console.log('Initial verified stock snapshot saved.');
}
if (!checkOnly) {
  const saved = await request(`${siteUrl.replace(/\/$/, '')}/api/cron/bernat-stock`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot),
  });
  if (saved?.ok !== true) throw new Error('Website did not confirm saved stock');
  console.log('Flagstaff stock saved successfully.');
}
