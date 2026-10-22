/** @param {Record<string, string | undefined>} env @param {string} legacyName */
export function stockRefreshSecret(env, legacyName) {
  return env.STOCK_REFRESH_SECRET || env[legacyName];
}

/** Accept shared and supplier-specific keys during migration; never accept another supplier's key.
 * @param {string | null} authorization
 * @param {Record<string, string | undefined>} env
 * @param {string} legacyName
 * @returns {401 | 503 | null}
 */
export function stockRefreshAuthError(authorization, env, legacyName) {
  const secrets = [env.STOCK_REFRESH_SECRET, env[legacyName]].filter(Boolean);
  if (!secrets.length) return 503;
  return secrets.some(secret => authorization === `Bearer ${secret}`) ? null : 401;
}
