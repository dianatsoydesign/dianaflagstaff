// Keep request failures useful without logging URLs, credentials, or response bodies.
export async function stockRequest(url, options = {}, {
  service,
  fetchImpl = fetch,
  sleep = ms => new Promise(resolve => setTimeout(resolve, ms)),
  warn = console.warn,
} = {}) {
  const supplier = service === 'Michaels inventory';
  const delays = supplier ? [2000, 4000, 60000] : [2000, 4000];
  for (let attempt = 0; ; attempt++) {
    let status;
    try {
      const response = await fetchImpl(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(30000) });
      status = response.status;
      if (!response.ok) throw new Error(`HTTP ${status}`);
      return await response.json();
    } catch (error) {
      const message = status ? `HTTP ${status}` : 'network, timeout, or invalid JSON response';
      const retryable = !status || status >= 500 || status === 408 || status === 429 || (supplier && status === 403);
      if (!retryable || attempt >= delays.length) {
        throw new Error(`${service} failed: ${message} (attempt ${attempt + 1}).`, { cause: error });
      }
      const delay = delays[attempt];
      warn(`${service} failed: ${message}; retrying in ${delay / 1000}s (attempt ${attempt + 2}).`);
      await sleep(delay);
    }
  }
}
