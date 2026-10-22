#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fetchBobbinySnapshot } from '../src/lib/bobbiny-inventory.mjs';

const checkOnly = process.argv.includes('--check-only');
const writeBootstrap = process.argv.includes('--write-bootstrap');
const secret = process.env.BOBBINY_STOCK_SECRET;
const siteUrl = process.env.SITE_URL || 'https://dianaflagstaff.com';
if (writeBootstrap && !checkOnly) throw new Error('Use --check-only with --write-bootstrap');
if (!checkOnly && (!secret || new URL(siteUrl).protocol !== 'https:')) throw new Error('Set BOBBINY_STOCK_SECRET and an HTTPS SITE_URL');
const catalog = JSON.parse(await readFile(new URL('../src/data/bobbiny-premium-5mm.json', import.meta.url), 'utf8'));
const handles = catalog.yarns.map(yarn => yarn.supplierSku.slice('bobbiny:'.length));
if (!handles.length || new Set(handles).size !== handles.length) throw new Error('Empty or duplicate Bobbiny catalog');
const snapshot = await fetchBobbinySnapshot(handles);
console.log(`Checked ${handles.length} Bobbiny colors; ${Object.values(snapshot.quantities).filter(quantity => quantity !== null && quantity >= 1).length} have at least one skein in stock.`);
if (writeBootstrap) {
  await writeFile(new URL('../src/data/bobbiny-stock-bootstrap.json', import.meta.url), JSON.stringify(snapshot, null, 2) + '\n');
  console.log('Initial verified Bobbiny stock saved.');
}
if (!checkOnly) {
  const response = await fetch(`${siteUrl.replace(/\/$/, '')}/api/cron/bobbiny-stock`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(30000),
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot),
  });
  if (!response.ok || (await response.json()).ok !== true) throw new Error(`Bobbiny stock push failed (HTTP ${response.status})`);
  console.log('Bobbiny stock saved successfully.');
}
