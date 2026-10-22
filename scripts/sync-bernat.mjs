#!/usr/bin/env node
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
const masterSku = 'M10519837';
const swatchDir = join(root, 'public/yarn-swatches/bernat-blanket-big');
const imageDir = join(root, 'public/yarn-images/bernat-blanket-big');
mkdirSync(swatchDir, { recursive: true });
mkdirSync(imageDir, { recursive: true });
async function response(url) {
 const res = await fetch(url, { headers, signal: AbortSignal.timeout(60000) });
 if (!res.ok) throw new Error(`Michaels HTTP ${res.status}: ${url}`);
 return res;
}
const [master] = await (await response(`${api}/skus?skuNumbers=${masterSku}`)).json();
const skus = Object.values(master?.variantSkus ?? {});
if (!skus.length) throw new Error('No Bernat variants returned');
const subs = [];
for (let i=0;i<skus.length;i+=30) subs.push(...await (await response(`${api}/sub-skus?skuNumbers=${skus.slice(i,i+30).join(',')}`)).json());
const photoUrl = url => `${url.split('?')[0]}?fit=inside|1400:1400`;
const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const yarns = [];
const reviewQueue = [];
const familyOverrides = JSON.parse(readFileSync(join(root, 'src/data/bernat-color-families.json')));
let index=0;
async function worker() {
 while (index<subs.length) {
  const sub=subs[index++];
  const name=(sub.variantAttr ?? '').replace(/^\d+:\s*/,'').trim();
  const photos=(sub.media??[]).filter(m=>m.mediaType===0 && m.fullSizeUrl).sort((a,b)=>a.sort-b.sort).map(m=>m.fullSizeUrl);
  if(!name || !photos.length) throw new Error(`Missing Bernat photo/name for ${sub.skuNumber}`);
  const id=`bernat-blanket-big-${slug(name)}`;
  let hero;
  const colorImages=[];
  for (const url of [...new Set(photos)]) {
   const key=url.split('?')[0].split('/').pop().replace(/\.[a-z]+$/i,'');
   const local=join(imageDir,`${key}.webp`);
   if(!existsSync(local)) {
    const bytes=Buffer.from(await (await response(photoUrl(url))).arrayBuffer());
    await sharp(bytes).resize({width:1200,height:1200,fit:'inside',withoutEnlargement:true}).webp({quality:86}).toFile(local);
   }
   if(!hero) hero=readFileSync(local);
   colorImages.push(`/yarn-images/bernat-blanket-big/${key}.webp`);
  }
  const {width,height}=await sharp(hero).metadata();
  // These older catalog photos show an upright skein with its label through the middle.
  const upright = ['Pale Gray', 'Sky', 'Gray', 'Black', 'Vintage'].includes(name);
  const crop = upright ? {left:.4, top:.22, size:.2} : {left:.19, top:.42, size:.155};
  const side=Math.round(width*crop.size);
  const swatch=await sharp(hero).extract({left:Math.round(width*crop.left),top:Math.round(height*crop.top),width:side,height:side}).resize(240,240).webp({quality:82}).toBuffer();
  const swatchFile=`${id}-${createHash('sha256').update(swatch).digest('hex').slice(0,10)}.webp`;
  writeFileSync(join(swatchDir,swatchFile),swatch);
  const raw=await sharp(swatch).resize(32,32).removeAlpha().raw().toBuffer();
  const pixels=[];
  for(let i=0;i<raw.length;i+=3)pixels.push([raw[i],raw[i+1],raw[i+2]]);
  const {reviewNeeded,pixelFamily,...analysis}=classifyYarn(name,pixels,familyOverrides);
  const whiteShare=pixels.filter(p=>Math.min(...p)>245).length/pixels.length;
  if(reviewNeeded || whiteShare>.3)reviewQueue.push({name,pixelFamily,proposedFamily:analysis.colorGroup,possibleBadCrop:whiteShare>.3});
  yarns.push({id,name,swatchSrc:`/yarn-swatches/bernat-blanket-big/${swatchFile}`,colorImages,supplierSku:`michaels-bernat:${sub.skuNumber}`,stockStatus:'in_stock',...analysis});
  console.log(`Imported ${name} (${colorImages.length} photos)`);
 }
}
await Promise.all(Array.from({length:5},worker));
yarns.sort((a,b)=>a.sortRank-b.sortRank || a.name.localeCompare(b.name));
if(yarns.length!==subs.length) throw new Error('Incomplete Bernat import');
if(reviewQueue.length) {
 writeFileSync('/tmp/bernat-needs-review.json',JSON.stringify(reviewQueue,null,2));
 throw new Error('New or ambiguous colors/crops need review; catalog not replaced. See /tmp/bernat-needs-review.json');
}
writeFileSync(join(root,'src/data/bernat-blanket-big.json'),JSON.stringify({syncedAt:new Date().toISOString(),productUrl:'https://www.michaels.com/product/bernat-blanket-big-yarn-10750420',masterSku,availabilityMode:'catalog-unfiltered',yarns},null,2)+'\n');
console.log(`Saved ${yarns.length} colors; local stock filtering is disabled.`);
