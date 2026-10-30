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
  IMAGE_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  EMAIL_DB?: import("./src/lib/mail-runtime").EmailDatabase;
  RESEND_API_KEY?: string;
  ORDER_EMAIL_FROM?: string;
  ORDER_EMAIL_ENABLED?: string;
  ORDERS_KV?: KVNamespace;
  BOBBINY_STOCK?: KVNamespace;
  CRON_SECRET?: string;
  MAKER_PASSWORD?: string;
  ASSETS?: Fetcher;
  IMAGES?: ImagesBinding;
  NEXTJS_ENV?: string;
}
