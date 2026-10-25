import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const MAKER_COOKIE = "diana_flagstaff_maker_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export async function getMakerPassword(): Promise<string> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const password = (await getCloudflareContext({ async: true })).env.MAKER_PASSWORD;
    if (password) return password;
  } catch { /* Local Next.js can use .env.local. */ }
  return process.env.MAKER_PASSWORD || (process.env.NODE_ENV === "development" ? "DianasOrders!" : "");
}

function signature(payload: string, password: string): string {
  return createHmac("sha256", password).update(`maker-session:${payload}`).digest("base64url");
}

export function signMakerToken(password: string, now = Date.now()): string {
  const expiry = Math.floor(now / 1000) + SESSION_SECONDS;
  const payload = `v2.${expiry}`;
  return `${payload}.${signature(payload, password)}`;
}

export function verifyMakerToken(token: string, password: string, now = Date.now()): boolean {
  if (!password) return false;
  const [version, expiry, signed, extra] = token.split(".");
  if (version !== "v2" || !/^\d+$/.test(expiry ?? "") || !signed || extra) return false;
  const expiresAt = Number(expiry);
  const current = Math.floor(now / 1000);
  if (expiresAt <= current || expiresAt > current + SESSION_SECONDS) return false;
  const expected = Buffer.from(signature(`${version}.${expiry}`, password));
  const actual = Buffer.from(signed);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function isMakerAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(MAKER_COOKIE)?.value;
  return !!token && verifyMakerToken(token, await getMakerPassword());
}
