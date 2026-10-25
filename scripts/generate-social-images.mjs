import fs from 'node:fs/promises';
import ts from 'typescript';
import sharp from 'sharp';

// Read product literals through the TypeScript AST so cards track catalog names and hero photos.
const source = ts.createSourceFile('products.ts', await fs.readFile('src/data/products.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const products = [];
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'products' && ts.isArrayLiteralExpression(node.initializer)) {
    for (const item of node.initializer.elements) {
      const data = {};
      for (const prop of item.properties ?? []) {
        if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer)) data[prop.name.getText(source)] = prop.initializer.text;
      }
      if (data.id && data.name && data.imageSrc) products.push(data);
    }
  }
  ts.forEachChild(node, visit);
}
visit(source);
const escape = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
await fs.mkdir('public/social', { recursive: true });
async function card(id, title, photos, subtitle) {
  const layers = [];
  const photoWidth = Math.floor(570 / photos.length);
  for (let i = 0; i < photos.length; i++) {
    const input = await sharp(`public${photos[i]}`).rotate().resize(photoWidth - 12, 510, { fit: photos.length > 1 ? 'cover' : 'contain', background: '#f6f3ed' }).png().toBuffer();
    layers.push({ input, left: 600 + i * photoWidth, top: 60 });
  }
  const words = title.split(' '), lines = [''];
  for (const word of words) {
    if ((lines.at(-1) + word).length > 19) lines.push('');
    lines[lines.length - 1] += `${word} `;
  }
  const svg = `<svg width="1200" height="630"><rect width="1200" height="630" fill="#f6f3ed"/><g fill="#292821" font-family="sans-serif"><text x="55" y="105" font-size="30">Diana’s art</text>${lines.map((line, i) => `<text x="55" y="${230 + i * 60}" font-size="48">${escape(line.trim())}</text>`).join('')}<text x="55" y="470" font-size="23">${escape(subtitle)}</text><text x="55" y="515" font-size="22">Local pickup in Flagstaff, AZ</text><text x="55" y="565" font-size="20">dianaflagstaff.com</text></g></svg>`;
  await sharp(Buffer.from(svg)).composite(layers).jpeg({ quality: 88 }).toFile(`public/social/${id}-v1.jpg`);
}
for (const p of products) await card(p.id, p.name, [p.imageSrc], 'Handmade crochet');
await card('about', 'Meet Diana', ['/about/portrait-v5-mobile.jpg'], 'Artist. Maker. Crochet enthusiast.');
await card('shop', 'Made by hand. Made for you.', products.filter(p => ['elf-hat', 'coasters'].includes(p.id)).map(p => p.imageSrc), 'Crochet hats, home goods, and gifts');
console.log(`Generated ${products.length + 2} social preview cards.`);
