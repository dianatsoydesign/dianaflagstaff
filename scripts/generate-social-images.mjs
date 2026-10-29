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
        if (ts.isPropertyAssignment(prop) && ts.isStringLiteral(prop.initializer)) data[ts.isStringLiteral(prop.name) ? prop.name.text : prop.name.getText(source)] = prop.initializer.text;
      }
      if (data.id && data.name && data.imageSrc) products.push(data);
    }
  }
  ts.forEachChild(node, visit);
}
visit(source);
await fs.mkdir('public/social', { recursive: true });
async function card(id, photos, portrait = false) {
  const layers = [];
  const gap = photos.length > 1 ? 12 : 0;
  const photoWidth = Math.floor((1200 - gap * (photos.length - 1)) / photos.length);
  for (let i = 0; i < photos.length; i++) {
    const input = await sharp(`public${photos[i]}`).rotate().resize(photoWidth, 630, {
      fit: portrait ? 'cover' : 'contain',
      position: 'centre',
      background: '#f6f3ed',
    }).png().toBuffer();
    layers.push({ input, left: i * (photoWidth + gap), top: 0 });
  }
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f6f3ed' } })
    .composite(layers).jpeg({ quality: 88 }).toFile(`public/social/${id}-${id === 'blanket' ? 'v3' : 'v2'}.jpg`);
}
const selectedId = process.argv.find(arg => arg.startsWith('--product='))?.split('=')[1];
if (selectedId && !products.some(p => p.id === selectedId)) throw new Error(`Unknown product: ${selectedId}`);
for (const p of products.filter(p => !selectedId || p.id === selectedId)) await card(p.id, [p.imageSrc]);
if (selectedId) process.exit(0);
await card('about', ['/about/portrait-v5.jpg'], true);
await card('shop', products.filter(p => ['mushroom-hat', 'coasters'].includes(p.id)).map(p => p.imageSrc));
console.log(`Generated ${products.length + 2} photography-only social preview cards.`);
