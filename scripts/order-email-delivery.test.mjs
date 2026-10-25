import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';
import { createRequire } from 'node:module';
const loadDependency = createRequire(import.meta.url);

function moduleFrom(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const context = { exports: {}, require: (name) => name in mocks ? mocks[name] : loadDependency(name), Buffer, process };
  vm.runInNewContext(code, context);
  return context.exports;
}
const { sendOrderEmail } = moduleFrom('src/lib/order-email-delivery.ts');
function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(fs.readFileSync('migrations/email/0001_order_emails.sql', 'utf8'));
  const db = { prepare(sql) { return { bind(...args) { return {
    async first() { return sqlite.prepare(sql).get(...args) ?? null; },
    async all() { return { results: sqlite.prepare(sql).all(...args) }; },
    async run() { return { meta: { changes: Number(sqlite.prepare(sql).run(...args).changes) } }; },
  }; } }; } };
  return { db, sqlite };
}
const payload = { from: 'Diana <orders@example.com>', to: 'customer@example.com', subject: 'Confirmed', body: 'Your order is confirmed.', replyTo: 'dianatsoydesign@gmail.com' };
const start = 1800000000000;

test('stores accepted sends and blocks duplicates even after provider key expiry', async () => {
  const { db, sqlite } = database(); let calls = 0;
  const provider = { async send(value, key) { calls++; assert.equal(value.replyTo, payload.replyTo); assert.equal(key, 'order/test/confirmed/v1'); return { id: 'email-1' }; } };
  assert.equal((await sendOrderEmail(db, provider, 'test', 'confirmed', payload, start)).alreadySent, false);
  assert.equal((await sendOrderEmail(db, provider, 'test', 'confirmed', payload, start + 30 * 86400000)).alreadySent, true);
  assert.equal(calls, 1); assert.equal(sqlite.prepare('SELECT status FROM order_emails').get().status, 'accepted');
});
test('concurrent sends acquire only one lease', async () => {
  const { db } = database(); let calls = 0; let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const provider = { async send() { calls++; await gate; return { id: 'email-2' }; } };
  const first = sendOrderEmail(db, provider, 'test', 'ready', payload, start);
  // Let the first request finish its reservation and reach the provider.
  await new Promise((resolve) => setImmediate(resolve));
  await assert.rejects(sendOrderEmail(db, provider, 'test', 'ready', payload, start), /already being processed/);
  release(); await first; assert.equal(calls, 1);
});
test('ambiguous failure retries with the same saved content and stable key', async () => {
  const { db } = database(); const keys = [];
  const provider = { async send(value, key) { keys.push(key); if (keys.length === 1) throw Error('network'); return { id: 'same-provider-result' }; } };
  await assert.rejects(sendOrderEmail(db, provider, 'test', 'confirmed', payload, start), /unknown/);
  await assert.rejects(sendOrderEmail(db, provider, 'test', 'confirmed', { ...payload, body: 'Changed' }, start + 10), /saved draft/);
  await sendOrderEmail(db, provider, 'test', 'confirmed', payload, start + 20);
  assert.equal(keys[0], keys[1]);
});
test('uncertain retries stop before the provider deduplication window expires', async () => {
  const { db } = database(); let calls = 0;
  const provider = { async send() { calls++; throw Error('network'); } };
  await assert.rejects(sendOrderEmail(db, provider, 'test', 'ready', payload, start));
  await assert.rejects(sendOrderEmail(db, provider, 'test', 'ready', payload, start + 23 * 3600000), /manual check/);
  assert.equal(calls, 1);
});
test('explicit provider rejection remains recorded without blind retries', async () => {
  const { db } = database(); let calls = 0;
  const provider = { async send() { calls++; return { rejected: true }; } };
  await assert.rejects(sendOrderEmail(db, provider, 'test', 'ready', payload, start), /rejected/);
  await assert.rejects(sendOrderEmail(db, provider, 'test', 'ready', payload, start + 1), /rejected/);
  assert.equal(calls, 1);
});
test('a failed journal write after provider acceptance recovers with the same key', async () => {
  const { db } = database(); let failWrite = true; const keys = [];
  const wrapped = { prepare(sql) { if (sql.includes("status = 'accepted'") && failWrite) { failWrite = false; throw Error('database unavailable'); } return db.prepare(sql); } };
  const provider = { async send(value, key) { keys.push(key); return { id: 'email-3' }; } };
  await assert.rejects(sendOrderEmail(wrapped, provider, 'test', 'confirmed', payload, start));
  await sendOrderEmail(db, provider, 'test', 'confirmed', payload, start + 61000);
  assert.equal(keys[0], keys[1]);
});
test('signed sessions reject forgery, expiry, changed passwords and old reversible cookies', () => {
  const { signMakerToken, verifyMakerToken } = moduleFrom('src/lib/maker-auth.ts', { 'next/headers': {} });
  const password = 'test-private-password-with-entropy';
  const token = signMakerToken(password, start);
  assert.equal(verifyMakerToken(token, password, start), true);
  assert.equal(verifyMakerToken(token + 'x', password, start), false);
  assert.equal(verifyMakerToken(token, 'different-password', start), false);
  assert.equal(verifyMakerToken(token, password, start + 8 * 86400000), false);
  assert.equal(verifyMakerToken(Buffer.from('maker:' + password).toString('base64url'), password, start), false);
  assert.equal(verifyMakerToken(token, '', start), false);
});
