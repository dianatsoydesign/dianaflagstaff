import test from 'node:test';
import assert from 'node:assert/strict';
import { personalizationError } from '../src/lib/stocking-personalization.mjs';
test('personalization is optional', () => assert.equal(personalizationError('christmas-stockings'),null));
test('all three placements accept seven characters', () => {
  for (const placement of ['top','center-horizontal','center-vertical']) assert.equal(personalizationError('christmas-stockings','Abigail',placement),null);
});
test('rejects long names, empty names, and invalid placements', () => {
  assert.match(personalizationError('christmas-stockings','Isabella','top'),/7 characters/);
  assert.match(personalizationError('christmas-stockings','   ','top'),/Enter/);
  assert.match(personalizationError('christmas-stockings','AJ','back'),/placement/);
  assert.match(personalizationError('hats','AJ','top'),/only available/);
});

test('stocking add-ons stack and curated palettes count as multicolor', async () => {
  const {stockingAddOnPrice,isMulticolorStocking} = await import('../src/lib/stocking-personalization.mjs');
  assert.equal(stockingAddOnPrice(false,false),0);
  assert.equal(stockingAddOnPrice(true,false),5);
  assert.equal(stockingAddOnPrice(false,true),5);
  assert.equal(stockingAddOnPrice(true,true),10);
  assert.equal(isMulticolorStocking({id:'charisma-soft-palette'}),true);
  assert.equal(isMulticolorStocking({id:'charisma-pine'}),false);
});
