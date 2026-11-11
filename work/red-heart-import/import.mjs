import fs from 'node:fs/promises';
import sharp from 'sharp';
const id='red-heart-super-saver-aran-fleck';
const dir=`public/yarn-images/ribbed-yarns/${id}`;
await fs.mkdir(dir,{recursive:true});
const row=JSON.parse(await fs.readFile('work/red-heart-import/color.json'))[0];
const master=JSON.parse(await fs.readFile('work/red-heart-import/master.json'))[0];
const sourceImages=row.media.filter(m=>m.mediaType===0).sort((a,b)=>a.sort-b.sort).map(m=>m.fullSizeUrl.split('?')[0]);
for(let n=1;n<=3;n++){
 await fs.copyFile(`work/red-heart-import/photo-${n}.jpg`,`${dir}/original-${n}.jpg`);
 await sharp(`work/red-heart-import/photo-${n}.jpg`).resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toFile(`${dir}/photo-${n}.webp`);
}
await fs.copyFile('work/red-heart-import/swatch-original.jpg',`${dir}/swatch-original.jpg`);
// Crop a label-free yarn patch from the reviewed high-resolution skein photo.
await sharp('work/red-heart-import/photo-2.jpg').extract({left:450,top:1750,width:900,height:900}).resize(240,240).webp({quality:90}).toFile(`${dir}/swatch.webp`);
const catalog=JSON.parse(await fs.readFile('src/data/ribbed-yarns.json'));
if(catalog.yarns.some(y=>y.supplierSku==='michaels:10224492'))throw Error('Duplicate SKU');
catalog.minimumStock=2;
catalog.lines.push({id:'red-heart-super-saver-flecks',name:master.itemName.replace(/[®™]/g,''),masterSku:master.masterSkuNumber,productUrl:'https://www.michaels.com/product/10224492',description:master.longDescription});
const colorImages=sourceImages.map((_,i)=>`/yarn-images/ribbed-yarns/${id}/photo-${i+1}.webp`);
catalog.yarns.push({id,name:'Aran Fleck',lineId:'red-heart-super-saver-flecks',lineName:master.itemName.replace(/[®™]/g,''),supplierSku:'michaels:10224492',swatchSrc:`/yarn-images/ribbed-yarns/${id}/swatch.webp`,colorImages,supplierImages:sourceImages,stockStatus:'in_stock',pickupMinimum:1,colorGroup:'neutrals',multicolor:false,tweed:true,sortRank:1004});
await fs.writeFile('src/data/ribbed-yarns.json',JSON.stringify(catalog,null,2)+'\n');
const families=JSON.parse(await fs.readFile('src/data/ribbed-yarn-color-families.json'));families[id]={colorGroup:'neutrals',multicolor:false,tweed:true};await fs.writeFile('src/data/ribbed-yarn-color-families.json',JSON.stringify(families,null,2)+'\n');
const review=JSON.parse(await fs.readFile('src/data/yarn-gallery-image-review.json'));sourceImages.forEach((url,i)=>{review.images[url]='yarn';review.images[colorImages[i]]='yarn';});await fs.writeFile('src/data/yarn-gallery-image-review.json',JSON.stringify(review,null,2)+'\n');
const stock=JSON.parse(await fs.readFile('src/data/charisma-stock-bootstrap.json'));stock.quantities['10224492']=20;await fs.writeFile('src/data/charisma-stock-bootstrap.json',JSON.stringify(stock,null,2)+'\n');
