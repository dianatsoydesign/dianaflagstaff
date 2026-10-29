#!/usr/bin/env node
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { classifyYarn } from '../.cursor/skills/yarn-catalog/scripts/classify-yarn.mjs';
import { pickupQuantities } from '../src/lib/bernat-inventory.mjs';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const API='https://www.michaels.com/api/product/v2';
async function request(url){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Michaels HTTP ${r.status}`);return r;}
async function original(url,path){try{await access(path);return;}catch{}await writeFile(path,Buffer.from(await(await request(url)).arrayBuffer()));}
const [master]=await(await request(`${API}/skus?skuNumbers=10610036`)).json();
const skus=Object.values(master.variantSkus??{});if(!skus.length)throw Error('Empty Sweet Snuggles catalog');
const checkedAt=Date.now();
const rows=await(await request(`${API}/sub-skus?`+new URLSearchParams({skuNumbers:skus.join(','),michaelsStoreId:'9608',source:'pdpPage'}))).json();
const quantities=pickupQuantities(rows,skus);
const families={Pink:'pinks',Turquoise:'blues',Fog:'neutrals','Sky Blue':'blues',White:'neutrals',Rose:'pinks',Yellow:'yellows','Chalk Blue':'blues','Winter White':'neutrals',Gray:'neutrals',Denim:'blues',Red:'reds',Mint:'greens',Blue:'blues',Purple:'purples',Black:'neutrals','Green Ash':'greens',Lavender:'purples',Coral:'oranges',Blush:'pinks',Teal:'greens',Silver:'neutrals'};
const yarns=[];
async function importColor(row){const name=row.variantAttr.replace(/^\d+:\s*/,'').trim();if(!families[name])throw Error(`Review new color ${name}`);const id='sweet-snuggles-'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-');const dir=join(root,'public/yarn-images/sweet-snuggles',id);await mkdir(dir,{recursive:true});const media=row.media.filter(m=>m.mediaType===0&&m.fullSizeUrl).sort((a,b)=>a.sort-b.sort);if(!media.length||!media[0].swatchImageUrl)throw Error('Missing supplier photos');const colorImages=[];for(const [i,m]of media.entries()){const src=join(dir,`original-${i+1}.jpg`);await original(m.fullSizeUrl.split('?')[0],src);await sharp(src).resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(join(dir,`photo-${i+1}.webp`));colorImages.push(`/yarn-images/sweet-snuggles/${id}/photo-${i+1}.webp`)}const src=join(dir,'swatch-original.jpg');await original(media[0].swatchImageUrl,src);const swatch=await sharp(src).resize(240,240,{fit:'cover'}).webp({quality:88}).toBuffer();await writeFile(join(dir,'swatch.webp'),swatch);const raw=await sharp(swatch).resize(32,32).removeAlpha().raw().toBuffer();const pixels=[];for(let i=0;i<raw.length;i+=3)pixels.push([raw[i],raw[i+1],raw[i+2]]);const classification=classifyYarn(name,pixels,families);yarns.push({id,name,supplierSku:`michaels-sweet-snuggles:${row.skuNumber}`,swatchSrc:`/yarn-images/sweet-snuggles/${id}/swatch.webp`,colorImages,stockStatus:(quantities[row.skuNumber]??0)>0?'in_stock':'out_of_stock',...classification});}
for(let i=0;i<rows.length;i+=4)await Promise.all(rows.slice(i,i+4).map(importColor));
const order=['greens','yellows','oranges','reds','pinks','purples','blues','neutrals'];yarns.sort((a,b)=>order.indexOf(a.colorGroup)-order.indexOf(b.colorGroup)||a.sortRank-b.sortRank);
await writeFile(join(root,'src/data/sweet-snuggles.json'),JSON.stringify({masterSku:master.masterSkuNumber,productUrl:'https://www.michaels.com/product/sweet-snuggles-yarn-by-loops-threads-10610036',syncedAt:new Date().toISOString(),yarns},null,2)+'\n');
await writeFile(join(root,'src/data/sweet-snuggles-color-families.json'),JSON.stringify(Object.fromEntries(yarns.map(y=>[y.name,y.colorGroup])),null,2)+'\n');
await writeFile(join(root,'src/data/sweet-snuggles-stock-bootstrap.json'),JSON.stringify({storeId:'9608',checkedAt,quantities},null,2)+'\n');
console.log(`Imported ${yarns.length} colors; ${yarns.filter(y=>y.stockStatus==='in_stock').length} have verified pickup stock; unavailable colors remain catalogued but hidden.`);
