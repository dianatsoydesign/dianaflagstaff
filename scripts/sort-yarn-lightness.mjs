import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root=process.cwd(); const require=createRequire(path.join(root,'package.json')); const sharp=require('sharp');
const yarns=new Map();
for(const name of ['charisma','hat-yarns','bernat-blanket-big','sweet-snuggles','bobbiny-premium-5mm']) for(const y of JSON.parse(fs.readFileSync(`src/data/${name}.json`)).yarns??[]) yarns.set(y.id, name === "bobbiny-premium-5mm" ? {...y, swatchSrc: `/yarn-swatches/bobbiny/${y.id}.webp`} : y);
const entries=[];
for(const y of yarns.values()) {
 const {data,info}=await sharp(path.join(root,'public',y.swatchSrc)).resize(32,32).removeAlpha().raw().toBuffer({resolveWithObject:true});
 let lightness=0; for(let i=0;i<data.length;i+=info.channels) {const rgb=[data[i],data[i+1],data[i+2]].map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});const l=.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];lightness+=l>216/24389?(116*Math.cbrt(l)-16)/100:l*(24389/27)/100;}
 entries.push({...y,lightness:lightness/(data.length/info.channels)});
}
entries.sort((a,b)=>b.lightness-a.lightness);
fs.writeFileSync(process.argv.includes('--write') ? 'src/data/yarn-lightness.json' : '/tmp/all-yarn-lightness.json',JSON.stringify(Object.fromEntries(entries.map(y=>[y.id,Number(y.lightness.toFixed(6))])),null,2)+'\n');
const tiles=[];for(let i=0;i<entries.length;i++){const y=entries[i],left=i%6*180,top=Math.floor(i/6)*155; tiles.push({input:await sharp(path.join(root,'public',y.swatchSrc)).resize(115,115).png().toBuffer(),left:left+30,top});const label=y.name.replace(/&/g,'&amp;').replace(/</g,'&lt;');tiles.push({input:Buffer.from(`<svg width="180" height="35"><text x="4" y="15" font-size="11">${label}</text><text x="4" y="30" font-size="10">${y.lightness.toFixed(3)}</text></svg>`),left,top:top+116});}
await sharp({create:{width:1080,height:Math.ceil(entries.length/6)*155,channels:3,background:'white'}}).composite(tiles).png().toFile('/tmp/all-yarn-order-review.png');console.log(entries.length+' yarn swatches reviewed in /tmp/all-yarn-order-review.png');
