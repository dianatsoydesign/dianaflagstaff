import test from 'node:test';
import assert from 'node:assert/strict';
import { availableForCatCave, freshSnapshot, MAX_STOCK_AGE_MS, pickupQuantities, validSnapshot } from '../src/lib/bernat-inventory.mjs';

const now = Date.now();
const snapshot = { storeId: '9608', checkedAt: now, quantities: { '100': 3, '101': 2, '102': 0, '103': null } };

test('requires at least three skeins of the chosen color', () => {
  assert.equal(availableForCatCave(snapshot, '100', now), true);
  for (const sku of ['101', '102', '103', '999']) assert.equal(availableForCatCave(snapshot, sku, now), false);
});

test('expires at two hours, including the exact boundary', () => {
  assert.equal(freshSnapshot(snapshot, now + MAX_STOCK_AGE_MS - 1), true);
  assert.equal(freshSnapshot(snapshot, now + MAX_STOCK_AGE_MS), false);
  assert.equal(availableForCatCave(snapshot, '100', now + MAX_STOCK_AGE_MS), false);
  assert.equal(availableForCatCave(null, '100', now), false);
});

test('rejects other stores, future timestamps, and malformed quantities', () => {
  assert.equal(validSnapshot({ ...snapshot, storeId: '1234' }, now), false);
  assert.equal(validSnapshot({ ...snapshot, checkedAt: now + 1 }, now), false);
  for (const quantity of [-1, 1.5, '3', true, Infinity]) {
    assert.equal(validSnapshot({ ...snapshot, quantities: { '100': quantity } }, now), false);
  }
});

test('shipping stock never qualifies as Flagstaff pickup stock', () => {
  const rows = [{ skuNumber: '100', inventoryMcu: { availableQuantity: 10000 } }];
  assert.deepEqual(pickupQuantities(rows, ['100']), { '100': null });
  assert.equal(availableForCatCave({ ...snapshot, quantities: pickupQuantities(rows, ['100']) }, '100', now), false);
});

test('extracts exact pickup count and rejects wrong-store or incomplete batches', () => {
  const rows = [{ skuNumber: '100', inventoryStorePickUp: { skuNumber: '100', michaelsStoreId: '9608', availableQuantity: 3 } }];
  assert.deepEqual(pickupQuantities(rows, ['100']), { '100': 3 });
  assert.throws(() => pickupQuantities(rows, ['100', '101']));
  assert.throws(() => pickupQuantities([...rows, ...rows], ['100']));
  assert.throws(() => pickupQuantities([{ ...rows[0], inventoryStorePickUp: { ...rows[0].inventoryStorePickUp, michaelsStoreId: '1234' } }], ['100']));
  assert.throws(() => pickupQuantities([{ ...rows[0], inventoryStorePickUp: { ...rows[0].inventoryStorePickUp, availableQuantity: undefined } }], ['100']));
});
