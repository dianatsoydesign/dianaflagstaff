import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stockRefreshSecret, stockRefreshAuthError } from '../src/lib/stock-refresh-auth.mjs';
for (const name of ['BOBBINY_STOCK_SECRET', 'CHARISMA_STOCK_SECRET', 'BERNAT_STOCK_SECRET']) {
  test(`${name}: shared key and safe legacy migration`, () => {
    const env = { STOCK_REFRESH_SECRET: 'shared-test', [name]: 'legacy-test', OTHER_STOCK_SECRET: 'unrelated-test' };
    assert.equal(stockRefreshSecret(env, name), 'shared-test');
    assert.equal(stockRefreshSecret({ [name]: 'legacy-test' }, name), 'legacy-test');
    for (const token of ['shared-test', 'legacy-test']) assert.equal(stockRefreshAuthError(`Bearer ${token}`, env, name), null);
    for (const token of [null, '', 'Bearer ', 'Bearer unrelated-test', 'Bearer wrong', 'shared-test']) assert.equal(stockRefreshAuthError(token, env, name), 401);
    assert.equal(stockRefreshAuthError('Bearer shared-test', { STOCK_REFRESH_SECRET: 'shared-test' }, name), null);
    assert.equal(stockRefreshAuthError('Bearer legacy-test', { [name]: 'legacy-test' }, name), null);
    assert.equal(stockRefreshAuthError('Bearer undefined', {}, name), 503);
    assert.equal(stockRefreshAuthError('Bearer ', { STOCK_REFRESH_SECRET: '', [name]: '' }, name), 503);
  });
}
