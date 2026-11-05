import test from 'node:test';
import assert from 'node:assert/strict';
import { stockRequest } from './stock-request.mjs';

test('Michaels 403 gets a longer final retry and can recover', async () => {
  const delays = [], warnings = [];
  let calls = 0;
  const result = await stockRequest('https://example.test', {}, {
    service: 'Michaels inventory',
    fetchImpl: async () => ++calls < 4 ? new Response('', { status: 403 }) : Response.json({ ok: true }),
    sleep: async ms => delays.push(ms), warn: message => warnings.push(message),
  });
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(delays, [2000, 4000, 60000]);
  assert.match(warnings[2], /Michaels inventory.*HTTP 403.*60s/);
});

test('website authentication failure is identified and never retried', async () => {
  let calls = 0;
  await assert.rejects(stockRequest('https://example.test', {}, {
    service: 'Website stock save',
    fetchImpl: async () => { calls++; return new Response('', { status: 403 }); },
    sleep: async () => assert.fail('must not retry'),
  }), /Website stock save failed: HTTP 403 \(attempt 1\)/);
  assert.equal(calls, 1);
});

test('persistent supplier blocks stop after four attempts', async () => {
  let calls = 0;
  await assert.rejects(stockRequest('https://example.test', {}, {
    service: 'Michaels inventory',
    fetchImpl: async () => { calls++; return new Response('', { status: 403 }); },
    sleep: async () => {}, warn: () => {},
  }), /Michaels inventory failed: HTTP 403 \(attempt 4\)/);
  assert.equal(calls, 4);
});

test('network failures retry without exposing sensitive error text', async () => {
  const warnings = [];
  await assert.rejects(stockRequest('https://example.test', {}, {
    service: 'Website stock save',
    fetchImpl: async () => { throw new Error('secret-value'); },
    sleep: async () => {}, warn: message => warnings.push(message),
  }), /Website stock save failed: network, timeout, or invalid JSON response \(attempt 3\)/);
  assert.ok(warnings.every(message => !message.includes('secret-value')));
});
