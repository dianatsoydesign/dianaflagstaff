#!/usr/bin/env node
import { reviewedSupplierYarnImages, assertYarnImageDestination } from '../src/lib/yarn-gallery-image-policy.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
process.chdir(root);
import {createRequire} from 'node:module';
const require=createRequire(new URL('../package.json',import.meta.url));const sharp=require('sharp');
async function cachedImage(url, file) {
  try { return await readFile(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`Supplier image HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(file, bytes);
  return bytes;
}

const {classifyYarn}=await import('../.cursor/skills/yarn-catalog/scripts/classify-yarn.mjs');
const masters=[];
for(const sku of ['10315190','10058763','10166420','10781028','10696975','10706269','10796210','10696993','10806964']) {
 const response=await fetch(`https://www.michaels.com/api/product/v2/skus?skuNumbers=${sku}`);
 if(!response.ok)throw Error(`Catalog HTTP ${response.status}`);
 masters.push((await response.json())[0]);
}
// This command stages new candidates only. Review classifications and images before activation.
const ids=['caron-simply-soft','bernat-softee-baby','red-heart-super-saver','caron-groovy-cloud-cakes','caron-cloud-cakes','caron-cinnamon-swirl-cakes','caron-sweetie-cakes','caron-baby-cakes','big-twist-living'];
const catalog={syncedAt:new Date().toISOString(),storeId:'9608',minimumStock:3,skeinsPerItem:1,lines:[],yarns:[],excluded:[]};const quantities={};
for(const [i,m]of masters.entries()){
 const lineId=ids[i],skus=Object.values(m.variantSkus).filter(s=>/^\d+$/.test(s));const rows=[];
 for(let j=0;j<skus.length;j+=25){const r=await fetch(`https://www.michaels.com/api/product/v2/sub-skus?skuNumbers=${skus.slice(j,j+25).join(',')}&michaelsStoreId=9608&source=pdpPage`);if(!r.ok)throw Error(r.status);rows.push(...await r.json());}
 catalog.lines.push({id:lineId,name:m.itemName.replace(/[®™]/g,''),masterSku:m.masterSkuNumber,productUrl:`https://www.michaels.com/product/${m.skuNumber}`,description:m.longDescription});
 for(const row of rows){
 const minimum=Number(row.shipping?.bopisMinimumOrderQuantity);const step=Number(row.shipping?.bopisStepQuantity);if(minimum!==1||step!==1){catalog.excluded.push({sku:row.skuNumber,name:row.variantAttr,reason:'Pickup purchase minimum or increment is not one',minimum,step});continue;}
 const name=row.variantAttr.replace(/^\d+:\s*/,''),id=`${lineId}-${name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
 const media=row.media?.filter(x=>x.mediaType===0&&x.fullSizeUrl).sort((a,b)=>a.sort-b.sort);const swatchUrl=media?.[0]?.swatchImageUrl;if(!swatchUrl){catalog.excluded.push({sku:row.skuNumber,name,reason:'No supplier texture swatch'});continue;}
 const dir=`work/ribbed-yarn-review/assets/${id}`;await mkdir(dir,{recursive:true});
 const swatch=await cachedImage(swatchUrl.split('?')[0], `${dir}/swatch-original.jpg`);await sharp(swatch).resize(240,240,{fit:'cover'}).webp({quality:88}).toFile(`${dir}/swatch.webp`);
 const {data,info}=await sharp(swatch).resize(32,32,{fit:'cover'}).removeAlpha().raw().toBuffer({resolveWithObject:true});const pixels=[];for(let p=0;p<data.length;p+=info.channels)pixels.push([...data.subarray(p,p+3)]);const classification=classifyYarn(name,pixels);if(i>=3 && i<=7)Object.assign(classification,{colorGroup:'multis',multicolor:true});
 const allSourceImages=[...new Set(media.map(image=>image.fullSizeUrl.split('?')[0]))];
 const supplierImages=reviewedSupplierYarnImages(allSourceImages);
 const colorImages=[];
 for(const [index,url] of allSourceImages.entries()) {
  if(!supplierImages.includes(url))continue;
  assertYarnImageDestination(`/yarn-images/ribbed-yarns/${id}/photo-${index+1}.webp`);
  const photo=await cachedImage(url, `${dir}/original-${index+1}.jpg`);
  await sharp(photo).resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(`${dir}/photo-${index+1}.webp`);
  colorImages.push(`/yarn-images/ribbed-yarns/${id}/photo-${index+1}.webp`);
 }
 const pickup=row.inventoryStorePickUp;const qty=pickup&&String(pickup.michaelsStoreId)==='9608'&&pickup.skuNumber===row.skuNumber&&Number.isSafeInteger(pickup.availableQuantity)?pickup.availableQuantity:null;quantities[row.skuNumber]=qty;
 catalog.yarns.push({id,name,lineId,lineName:catalog.lines.at(-1).name,supplierSku:`michaels:${row.skuNumber}`,swatchSrc:`/yarn-images/ribbed-yarns/${id}/swatch.webp`,colorImages,supplierImages,stockStatus:qty>=3?'in_stock':'out_of_stock',pickupMinimum:minimum,...classification});
 }
 console.log(lineId,rows.length,'colors',catalog.yarns.filter(y=>y.lineId===lineId&&y.stockStatus==='in_stock').length,'available');
 await writeFile('work/ribbed-yarn-review/catalog.json',JSON.stringify(catalog,null,2));await writeFile('work/ribbed-yarn-review/stock.json',JSON.stringify({storeId:'9608',checkedAt:Date.now(),quantities},null,2));
}
