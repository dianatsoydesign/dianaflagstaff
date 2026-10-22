import test from 'node:test';
import assert from 'node:assert/strict';
import { availableBobbiny, parseBobbinyCount, validBobbinySnapshot } from '../src/lib/bobbiny-inventory.mjs';

test('requires at least one skein and preserves last verified choices through an outage', () => {
  const snapshot = { checkedAt: Date.now() - 7 * 86400000, quantities: { natural: 1, misty: 0, unknown: null } };
  assert.equal(availableBobbiny(snapshot, 'natural'), true);
  for (const handle of ['misty', 'unknown', 'missing']) assert.equal(availableBobbiny(snapshot, handle), false);
});

test('reads the actual supplier count, including zero, and ignores unrelated stock text', () => {
  for (const [text, expected] of [['1 in stock', 1], ['Low stock: 1 left', 1], ['Low stock: 3 left', 3], ['0 in stock', 0], ['1,234 in stock', 1234], ['Sold out', 0]]) {
    assert.equal(parseBobbinyCount(`<p>999 in stock</p><bobbinycords-inventory>&nbsp;${text}</bobbinycords-inventory>`), expected);
  }
  assert.throws(() => parseBobbinyCount('<p>999 in stock</p>'));
  assert.throws(() => parseBobbinyCount('<bobbinycords-inventory>Available to order</bobbinycords-inventory>'));
});

test('rejects malformed snapshots', () => {
  for (const quantity of [-1, '1', true, 1.5]) assert.equal(validBobbinySnapshot({ checkedAt: Date.now(), quantities: { natural: quantity } }), false);
  assert.equal(validBobbinySnapshot({ checkedAt: Date.now() + 86400000, quantities: { natural: 1 } }), false);
});
