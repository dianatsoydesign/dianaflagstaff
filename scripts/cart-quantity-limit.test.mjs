import test from 'node:test';
import assert from 'node:assert/strict';
import { remainingProductQuantity } from '../src/lib/cart-quantity-limit.mjs';
test('allows a third stocking and caps total across options at twenty', () => {
  const items = [{id:'a',productId:'christmas-stockings',quantity:2}];
  assert.equal(remainingProductQuantity({productId:'christmas-stockings'},items),18);
  assert.equal(remainingProductQuantity({productId:'christmas-stockings'},[{...items[0],quantity:20}]),0);
});
test('editing a line excludes itself and other products do not count', () => {
  const items=[{id:'a',productId:'hats',quantity:8},{id:'b',productId:'hats',quantity:5},{id:'c',productId:'coasters',quantity:20}];
  assert.equal(remainingProductQuantity({id:'a',productId:'hats'},items),15);
  assert.equal(remainingProductQuantity({productId:'hats'},items),7);
});
