import "server-only";

export interface EmailDatabase {
  prepare(sql: string): {
    bind(...values: (string | number | null)[]): {
      first<T>(): Promise<T | null>;
      all<T>(): Promise<{ results: T[] }>;
      run(): Promise<{ meta: { changes: number } }>;
    };
  };
}

export async function mailRuntime() {
  let bindings: Record<string, unknown> = {};
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    bindings = (await getCloudflareContext({ async: true })).env as unknown as Record<string, unknown>;
  } catch { /* Standard Next.js development has no Worker bindings. */ }
  const setting = (name: string) => String(bindings[name] || process.env[name] || "");
  const apiKey = setting("RESEND_API_KEY");
  const from = setting("ORDER_EMAIL_FROM");
  const password = setting("MAKER_PASSWORD");
  const database = bindings.EMAIL_DB as EmailDatabase | undefined;
  const enabled = setting("ORDER_EMAIL_ENABLED") === "true";
  const issues: string[] = [];
  if (!enabled) issues.push("Direct email sending is switched off.");
  if (!apiKey) issues.push("Add the Resend API key.");
  if (!from || /[\r\n]/.test(from) || !/@[^\s<>]+\.[^\s<>]+/.test(from)) issues.push("Configure a verified sender address.");
  if (!database) issues.push("Connect the email history database.");
  if (password.length < 16 || password === "DianasOrders!") issues.push("Set a private maker password of at least 16 characters.");
  return { apiKey, from, database, issues, ready: issues.length === 0 };
}
