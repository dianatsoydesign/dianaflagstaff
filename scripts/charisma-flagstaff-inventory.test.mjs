import test from 'node:test';
import assert from 'node:assert/strict';
import { availableForCharismaHat, availableForCharisma, pickupQuantities, validSnapshot } from '../src/lib/charisma-inventory.mjs';

const now = Date.now();
const snapshot = { storeId: '9608', checkedAt: now, quantities: { '100': 3, '104': 2, '101': 1, '102': 0, '103': null } };

test('hides Limited Quantity pickup colors below three skeins', () => {
  assert.equal(availableForCharismaHat(snapshot, '100', now), true);
  for (const sku of ['104', '101', '102', '103', '999']) assert.equal(availableForCharismaHat(snapshot, sku, now), false);
});

test('keeps last verified colors during an extended stock-check outage', () => {
  for (const age of [2 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000]) {
    assert.equal(availableForCharismaHat(snapshot, '100', now + age), true);
    assert.equal(availableForCharismaHat(snapshot, '101', now + age), false);
    assert.equal(availableForCharismaHat(snapshot, '103', now + age), false);
  }
  assert.equal(availableForCharismaHat(null, '100', now), false);
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
  assert.equal(availableForCharismaHat({ ...snapshot, quantities: pickupQuantities(rows, ['100']) }, '100', now), false);
});

test('extracts exact pickup count and rejects wrong-store or incomplete batches', () => {
  const rows = [{ skuNumber: '100', inventoryStorePickUp: { skuNumber: '100', michaelsStoreId: '9608', availableQuantity: 3 } }];
  assert.deepEqual(pickupQuantities(rows, ['100']), { '100': 3 });
  assert.throws(() => pickupQuantities(rows, ['100', '101']));
  assert.throws(() => pickupQuantities([...rows, ...rows], ['100']));
  assert.throws(() => pickupQuantities([{ ...rows[0], inventoryStorePickUp: { ...rows[0].inventoryStorePickUp, michaelsStoreId: '1234' } }], ['100']));
  assert.throws(() => pickupQuantities([{ ...rows[0], inventoryStorePickUp: { ...rows[0].inventoryStorePickUp, availableQuantity: undefined } }], ['100']));
});

test('hats require two skeins and stockings require three from the same snapshot', () => {
  const shared = { ...snapshot, quantities: { '100': 2, '101': 3 } };
  assert.equal(availableForCharisma(shared, '100', 2, now), true);
  assert.equal(availableForCharisma(shared, '100', 3, now), false);
  assert.equal(availableForCharisma(shared, '101', 3, now), true);
});

// Caron Slice is a larger cake and has an explicit two-skein minimum.
test('Caron Slice accepts two pickup skeins but not one', () => {
  const caron = { ...snapshot, quantities: { '10783486': 2 } };
  assert.equal(availableForCharismaHat(caron, '10783486', now), true);
  assert.equal(availableForCharismaHat({ ...caron, quantities: { '10783486': 1 } }, '10783486', now), false);
});

test('Chunky Cakes accepts two pickup skeins but not one', () => {
  const chunky = { ...snapshot, quantities: { '10532738': 2 } };
  assert.equal(availableForCharismaHat(chunky, '10532738', now), true);
  assert.equal(availableForCharismaHat({ ...chunky, quantities: { '10532738': 1 } }, '10532738', now), false);
});

test('Bernat Fluffee accepts two pickup skeins but not one', () => {
  const fluffee = { ...snapshot, quantities: { '10750444': 2 } };
  assert.equal(availableForCharismaHat(fluffee, '10750444', now), true);
  assert.equal(availableForCharismaHat({ ...fluffee, quantities: { '10750444': 1 } }, '10750444', now), false);
});
