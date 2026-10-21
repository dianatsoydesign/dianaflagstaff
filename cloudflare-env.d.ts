/** Minimal Workers KV surface used by maker orders and Bobbiny stock (full `wrangler types` optional). */
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
}

interface CloudflareEnv {
  ORDERS_KV?: KVNamespace;
  BOBBINY_STOCK?: KVNamespace;
  CRON_SECRET?: string;
  MAKER_PASSWORD?: string;
  ASSETS?: Fetcher;
  IMAGES?: ImagesBinding;
  NEXTJS_ENV?: string;
}
