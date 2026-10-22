import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {classifyYarn,FAMILIES} from './classify-yarn.mjs';
const root=process.cwd();
const require=createRequire(join(root,'package.json'));
const sharp=require('sharp');
const [catalogArg,overridesArg]=process.argv.slice(2);
if(!catalogArg)throw new Error('Usage: node audit-catalog.mjs <catalog.json> <families.json> [--write]');
const path=resolve(root,catalogArg);
const catalog=JSON.parse(readFileSync(path));
const overrides=overridesArg && !overridesArg.startsWith('--')?JSON.parse(readFileSync(resolve(root,overridesArg))):{};
const ids=new Set(),reviews=[];
for(const yarn of catalog.yarns){
 if(ids.has(yarn.id))throw new Error(`Duplicate ID: ${yarn.id}`);ids.add(yarn.id);
 const swatch=readFileSync(join(root,'public',yarn.swatchSrc));
 for(const f of yarn.colorImages??[])if(f.startsWith('/'))readFileSync(join(root,'public',f));
 const raw=await sharp(swatch).resize(32,32).removeAlpha().raw().toBuffer();
 const pixels=[];for(let i=0;i<raw.length;i+=3)pixels.push([raw[i],raw[i+1],raw[i+2]]);
 const {reviewNeeded,pixelFamily,...classification}=classifyYarn(yarn.name,pixels,overrides);
 const white=pixels.filter(p=>Math.min(...p)>245).length/pixels.length;
 if(reviewNeeded || white>.3)reviews.push({name:yarn.name,namedFamily:classification.colorGroup,pixelFamily,possibleBadCrop:white>.3});
 Object.assign(yarn,classification);
}
catalog.yarns.sort((a,b)=>a.sortRank-b.sortRank || a.name.localeCompare(b.name));
const groups=FAMILIES.map(id=>({id,yarns:catalog.yarns.filter(y=>y.colorGroup===id)})).filter(g=>g.yarns.length);
const rows=groups.reduce((sum,g)=>sum+1+Math.ceil(g.yarns.length/8),0);
const tiles=[];let row=0;
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
for(const group of groups){
 tiles.push({input:Buffer.from(`<svg width="1120" height="30"><text x="8" y="23" font-family="sans-serif" font-size="20">${esc(group.id)} (${group.yarns.length})</text></svg>`),left:0,top:row*140});row++;
 for(let i=0;i<group.yarns.length;i++){
  const y=group.yarns[i],left=(i%8)*140,top=(row+Math.floor(i/8))*140;
  tiles.push({input:await sharp(join(root,'public',y.swatchSrc)).resize(110,110).toBuffer(),left:left+10,top});
  tiles.push({input:Buffer.from(`<svg width="140" height="25"><text x="4" y="17" font-family="sans-serif" font-size="11">${esc(y.name)}</text></svg>`),left,top:top+111});
 }row+=Math.ceil(group.yarns.length/8);
}
await sharp({create:{width:1120,height:rows*140,channels:3,background:'white'}}).composite(tiles).jpeg({quality:90}).toFile('/tmp/yarn-catalog-review.jpg');
writeFileSync('/tmp/yarn-catalog-review.json',JSON.stringify({count:ids.size,groups:groups.map(g=>({id:g.id,names:g.yarns.map(y=>y.name)})),reviews},null,2));
if(process.argv.includes('--write'))writeFileSync(path,JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({count:ids.size,reviewCount:reviews.length,contactSheet:'/tmp/yarn-catalog-review.jpg',report:'/tmp/yarn-catalog-review.json',written:process.argv.includes('--write')}));
