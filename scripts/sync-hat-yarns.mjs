#!/usr/bin/env node
// Additional hat-only yarn lines. Base Charisma retains its separate importer.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = join(root, 'src/data/hat-yarns.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const reviewed = JSON.parse(await readFile(join(root, 'src/data/hat-yarn-color-families.json'), 'utf8'));
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
async function request(url) { const response = await fetch(url, { signal: AbortSignal.timeout(30000) }); if (!response.ok) throw new Error(`Michaels HTTP ${response.status}`); return response; }
async function download(url, path) { try { await access(path); return; } catch {} await writeFile(path, Buffer.from(await (await request(url)).arrayBuffer())); }
const yarns = [];
for (const line of catalog.lines) {
  const [master] = await (await request(`https://www.michaels.com/api/product/v2/skus?skuNumbers=${line.masterSku}`)).json();
  const skus = Object.values(master?.variantSkus ?? {});
  if (!skus.length) throw new Error(`Empty catalog: ${line.name}`);
  const rows = await (await request(`https://www.michaels.com/api/product/v2/sub-skus?skuNumbers=${skus.join(',')}`)).json();
  for (const row of rows) {
    const name = row.variantAttr.replace(/^\d+:\s*/, '').trim(), id = `${line.id}-${slug(name)}`, settings = reviewed[id];
    if (!settings) throw new Error(`Review the new color before import: ${id}`);
    const media = row.media.filter(image => image.mediaType === 0 && image.fullSizeUrl).sort((a,b) => a.sort-b.sort);
    if (!media.length || !media[0].swatchImageUrl) throw new Error(`Missing supplier photos for ${id}`);
    const directory = join(root, 'public/yarn-images/hat-yarns', id); await mkdir(directory, { recursive:true });
    const colorImages = [];
    for (const [i,image] of media.entries()) {
      const original = join(directory, `original-${i+1}.jpg`); await download(image.fullSizeUrl.split('?')[0], original);
      await sharp(original).resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(join(directory,`photo-${i+1}.webp`));
      colorImages.push(`/yarn-images/hat-yarns/${id}/photo-${i+1}.webp`);
    }
    const original = join(directory, 'swatch-original.jpg'); await download(media[0].swatchImageUrl, original);
    const swatch = await sharp(original).resize(240,240,{fit:'cover'}).webp({quality:88}).toBuffer(); await writeFile(join(directory,'swatch.webp'),swatch);
    const {channels} = await sharp(swatch).greyscale().stats();
    yarns.push({id,name,lineId:line.id,lineName:line.name.replace(/[®™]/g,''),supplierSku:`michaels:${row.skuNumber}`,swatchSrc:`/yarn-images/hat-yarns/${id}/swatch.webp`,colorImages,stockStatus:'out_of_stock',...settings,sortRank:(settings.multicolor?2255:1255)-channels[0].mean});
  }
}
await writeFile(catalogPath, JSON.stringify({...catalog,syncedAt:new Date().toISOString(),yarns},null,2)+'\n');
console.log(`Refreshed ${yarns.length} hat-only colors. Run push-charisma-flagstaff-stock.mjs --check-only --write-bootstrap to verify pickup stock.`);
