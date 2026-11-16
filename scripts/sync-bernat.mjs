#!/usr/bin/env node
import { reviewedSupplierYarnImages } from '../src/lib/yarn-gallery-image-policy.mjs';
// Refresh the Bernat catalog and photos. Store availability is intentionally not filtered.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { classifyYarn } from '../.cursor/skills/yarn-catalog/scripts/classify-yarn.mjs';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const api = 'https://www.michaels.com/api/product/v2';
const headers = { Accept: 'application/json', 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36' };
const lines = [
 { masterSku: 'M10519837', key: 'classic', prefix: 'bernat-blanket-big', lineName: 'Bernat Blanket Big' },
 { masterSku: 'M20038502', key: 'mistical', prefix: 'bernat-blanket-big-mistical', lineName: 'Bernat Blanket Big Mist-ical' },
 { masterSku: 'M300003252', key: 'hopscotch', prefix: 'bernat-blanket-big-hopscotch', lineName: 'Bernat Blanket Big Hopscotch' },
];
const selectedLines = process.argv.filter(arg => arg.startsWith('--line=')).map(arg => arg.split('=')[1]);
if (selectedLines.some(key => !lines.some(line => line.key === key))) throw new Error('Unknown Bernat yarn line');
const activeLines = lines.filter(line => !selectedLines.length || selectedLines.includes(line.key));
const masterSku = lines[0].masterSku;
const swatchDir = join(root, 'public/yarn-swatches/bernat-blanket-big');
const imageDir = join(root, 'public/yarn-images/bernat-blanket-big');
mkdirSync(swatchDir, { recursive: true });
mkdirSync(imageDir, { recursive: true });
async function response(url) {
 const res = await fetch(url, { headers, signal: AbortSignal.timeout(60000) });
 if (!res.ok) throw new Error(`Michaels HTTP ${res.status}: ${url}`);
 return res;
}
const subs = [];
for (const line of activeLines) {
 const [master] = await (await response(`${api}/skus?skuNumbers=${line.masterSku}`)).json();
 const skus = Object.values(master?.variantSkus ?? {});
 if (!skus.length) throw new Error(`No Bernat variants returned for ${line.key}`);
 for (let i=0;i<skus.length;i+=30) {
  const batch = await (await response(`${api}/sub-skus?skuNumbers=${skus.slice(i,i+30).join(',')}`)).json();
  subs.push(...batch.map(sub => ({...sub, line})));
 }
}
const photoUrl = url => `${url.split('?')[0]}?fit=inside|1400:1400`;
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const catalogPath = join(root, 'src/data/bernat-blanket-big.json');
const previous = JSON.parse(readFileSync(catalogPath));
const yarns = selectedLines.length ? previous.yarns.filter(yarn => !activeLines.some(line =>
 line.key === 'classic' ? !/bernat-blanket-big-(mistical|hopscotch)-/.test(yarn.id) : yarn.id.startsWith(line.prefix + '-')))
 : [];
let importedCount = 0;
const lightnessPath = join(root, 'src/data/yarn-lightness.json');
const lightness = JSON.parse(readFileSync(lightnessPath));
const reviewQueue = [];
const familyOverrides = JSON.parse(readFileSync(join(root, 'src/data/bernat-color-families.json')));
let index=0;
async function worker() {
 while (index<subs.length) {
  const sub=subs[index++];
  const name=(sub.variantAttr ?? '').replace(/^\d+:\s*/,'').trim();
  const photos=(sub.media??[]).filter(m=>m.mediaType===0 && m.fullSizeUrl).sort((a,b)=>a.sort-b.sort).map(m=>m.fullSizeUrl);
  photos.splice(0, photos.length, ...reviewedSupplierYarnImages(photos));
  if(!name || !photos.length) throw new Error(`Missing Bernat photo/name for ${sub.skuNumber}`);
  const id=`${sub.line.prefix}-${slug(name)}`;
  let hero;
  let detail;
  const colorImages=[];
  for (const url of [...new Set(photos)]) {
   const key=url.split('?')[0].split('/').pop().replace(/\.[a-z]+$/i,'');
   const local=join(imageDir,`${key}.webp`);
   if(!existsSync(local)) {
    const bytes=Buffer.from(await (await response(photoUrl(url))).arrayBuffer());
    await sharp(bytes).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toFile(local);
   }
   if(!hero) hero=readFileSync(local);
   else if (!detail) detail=readFileSync(local);
   colorImages.push(`/yarn-images/bernat-blanket-big/${key}.webp`);
  }
  const swatchSource = sub.line.key !== 'classic' && detail ? detail : hero;
  const {width,height}=await sharp(swatchSource).metadata();
  // These older catalog photos show an upright skein with its label through the middle.
  const upright = ['Pale Gray', 'Sky', 'Gray', 'Black', 'Vintage'].includes(name);
  const crop = sub.line.key !== 'classic' && detail ? {left:.2, top:.2, size:.6} : upright ? {left:.4, top:.22, size:.2} : {left:.19, top:.42, size:.155};
  const side=Math.round(width*crop.size);
  const swatch=await sharp(swatchSource).extract({left:Math.round(width*crop.left),top:Math.round(height*crop.top),width:side,height:side}).resize(240,240).webp({quality:82}).toBuffer();
  const swatchFile=`${id}-${createHash('sha256').update(swatch).digest('hex').slice(0,10)}.webp`;
  writeFileSync(join(swatchDir,swatchFile),swatch);
  const raw=await sharp(swatch).resize(32,32).removeAlpha().raw().toBuffer();
  const pixels=[];
  for(let i=0;i<raw.length;i+=3)pixels.push([raw[i],raw[i+1],raw[i+2]]);
  lightness[id] = Number((pixels.reduce((sum, pixel) => {
   const [r,g,b] = pixel.map(value => {const v=value/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});
   const luminance=.2126*r+.7152*g+.0722*b;
   return sum + (luminance>216/24389 ? (116*Math.cbrt(luminance)-16)/100 : luminance*(24389/27)/100);
  },0)/pixels.length).toFixed(6));
  const {reviewNeeded,pixelFamily,...analysis}=classifyYarn(name,pixels,familyOverrides);
  const whiteShare=pixels.filter(p=>Math.min(...p)>245).length/pixels.length;
  if(reviewNeeded || whiteShare>.3)reviewQueue.push({name,pixelFamily,proposedFamily:analysis.colorGroup,possibleBadCrop:whiteShare>.3});
  yarns.push({id,name,swatchSrc:`/yarn-swatches/bernat-blanket-big/${swatchFile}`,colorImages,supplierSku:`michaels-bernat:${sub.skuNumber}`,stockStatus:'in_stock',lineName:sub.line.lineName,sourceImages:photos.map((url,i)=>({url,local:colorImages[i]})),...analysis});
  importedCount++;
  console.log(`Imported ${name} (${colorImages.length} photos)`);
 }
}
await Promise.all(Array.from({length:5},worker));
yarns.sort((a,b)=>a.sortRank-b.sortRank || a.name.localeCompare(b.name));
if(importedCount!==subs.length) throw new Error('Incomplete Bernat import');
if(reviewQueue.length) {
 writeFileSync('/tmp/bernat-needs-review.json',JSON.stringify(reviewQueue,null,2));
 throw new Error('New or ambiguous colors/crops need review; catalog not replaced. See /tmp/bernat-needs-review.json');
}
writeFileSync(lightnessPath,JSON.stringify(lightness,null,2)+'\n');
writeFileSync(join(root,'src/data/bernat-blanket-big.json'),JSON.stringify({syncedAt:new Date().toISOString(),productUrl:'https://www.michaels.com/product/bernat-blanket-big-yarn-10750420',masterSku,lines:lines.map(({masterSku,key,lineName})=>({masterSku,key,lineName})),availabilityMode:'catalog-unfiltered',yarns},null,2)+'\n');
console.log(`Saved ${yarns.length} colors; local stock filtering is disabled.`);
