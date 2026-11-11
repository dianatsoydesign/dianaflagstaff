import { test } from 'node:test';
import assert from 'node:assert/strict';
import { availableForRibbed, ribbedStockStatuses, RIBBED_SKEINS_PER_ITEM } from '../src/lib/ribbed-inventory.mjs';
const snapshot = qty => ({storeId:'9608',checkedAt:Date.now()-1000,quantities:{'123':qty}});
test('ribbed products require two verified Flagstaff skeins but consume one', () => {
  for (const qty of [null,0,1]) assert.equal(availableForRibbed(snapshot(qty),'123'),false);
  assert.equal(availableForRibbed(snapshot(2),'123'),true);
  assert.equal(RIBBED_SKEINS_PER_ITEM,1);
  assert.equal(availableForRibbed({...snapshot(9),storeId:'other'},'123'),false);
  assert.equal(availableForRibbed(null,'123'),false);
});
test('supplier stock never falls back to optimistic catalog stock',()=>{
  const yarns=[{id:'supplier',supplierSku:'michaels:123',stockStatus:'in_stock'},{id:'pictured',stockStatus:'in_stock'}];
  assert.deepEqual(ribbedStockStatuses(snapshot(1),yarns),{supplier:'out_of_stock',pictured:'in_stock'});
  assert.equal(ribbedStockStatuses(snapshot(3),yarns).supplier,'in_stock');
});

test('ribbed catalog keeps the ten approved Michaels lines, excludes 6 mm hooks, and cannot duplicate stock SKUs', async () => {
  const { default: catalog } = await import('../src/data/ribbed-yarns.json', { with: { type: 'json' } });
  const { MICHAELS_FLAGSTAFF_CATALOG } = await import('../src/data/michaels-hat-catalog.mjs');
  assert.equal(catalog.lines.length, 10);
  for (const line of catalog.lines) {
    const text = line.description.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
    const hook = text.match(/Suggested Crochet Hook:\s*([\d.]+)\s*mm/);
    assert.ok(hook, line.id);
    assert.ok(Number(hook[1]) < 6, line.id);
  }
  const skus = MICHAELS_FLAGSTAFF_CATALOG.map(yarn => yarn.supplierSku);
  assert.equal(new Set(skus).size, skus.length);
  assert.ok(skus.length <= 500);
  for (const yarn of catalog.yarns) assert.equal(yarn.pickupMinimum, 1);
  assert.equal(catalog.yarns.find(yarn => yarn.id === 'caron-simply-soft-blue-mint').colorGroup, 'blues');
});
