export const FAMILIES = ['greens','yellows','oranges','reds','pinks','purples','blues','browns','neutrals','multis'];
const median = a => [...a].sort((x,y)=>x-y)[Math.floor(a.length/2)];
export function pixelColor(pixels) {
 const rgb=[0,1,2].map(c=>median(pixels.map(p=>p[c]))/255);
 const [r,g,b]=rgb, max=Math.max(...rgb), min=Math.min(...rgb), d=max-min;
 const l=(max+min)/2, s=d===0?0:d/(1-Math.abs(2*l-1));
 let h=0;
 if(d) h=((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360;
 let family;
 if(l<.13 || (s<.16 && Math.max(r,b)-g<.04)) family='neutrals';
 else if(h>=15 && h<65 && l<.65 && s<.6) family='browns';
 else if(h<15 || h>=345) family='reds';
 else if(h<45) family='oranges';
 else if(h<70) family='yellows';
 else if(h<175) family='greens';
 else if(h<255) family='blues';
 else if(h<295) family='purples';
 else family='pinks';
 const linear=rgb.map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 const luminance=.2126*linear[0]+.7152*linear[1]+.0722*linear[2];
 const lightness=luminance>216/24389?(116*Math.cbrt(luminance)-16)/100:luminance*(24389/27)/100;
 return {h,s,l,lightness,family};
}
export function nameFamily(name) {
 const n=name.toLowerCase();
 if(/\b(splash|variegated|multicolor|mottled)\b/.test(n))return 'multis';
 if(/\b(black|gr[ae]y|white|ivory|vanilla|vintage)\b/.test(n))return 'neutrals';
 if(/\b(purple|plum|grape|amethyst|lilac|wisteria|violet|lavender)\b/.test(n))return 'purples';
 if(/\b(pink|rose|blush)\b/.test(n))return 'pinks';
 if(/\b(red|burgundy|cranberry|scarlet)\b/.test(n))return 'reds';
 if(/\b(terra cotta|terracotta|orange|rust)\b/.test(n))return 'oranges';
 if(/\b(gold|yellow|lemon|mustard)\b/.test(n))return 'yellows';
 if(/\b(teal|green|jade|minty?|leaf|pine|malachite|sage|olive|eucalyptus)\b/.test(n))return 'greens';
 if(/\b(blue|navy|sky|azure|denim)\b/.test(n))return 'blues';
 if(/\b(taupe|beige|caramel|espresso|scone|flax|brown|sand|coffee)\b/.test(n))return 'browns';
 return null;
}
export function classifyYarn(name,pixels,overrides={}) {
 if(!pixels.length)throw new Error('No swatch pixels');
 const visual=pixelColor(pixels);
 const named=nameFamily(name);
 const reviewed=overrides[name];
 if(reviewed && !FAMILIES.includes(reviewed))throw new Error(`Invalid reviewed family: ${reviewed}`);
 const colorGroup=reviewed??named??visual.family;
 // Within every family, sort from light to dark by perceptual CIE lightness.
 const within=(1-visual.lightness)*100;
 return {colorGroup,multicolor:colorGroup==='multis',sortRank:FAMILIES.indexOf(colorGroup)*1000+within,
  reviewNeeded:!reviewed && (!named || named!==visual.family),pixelFamily:visual.family};
}
