import { cookies } from "next/headers";

export const MAKER_COOKIE = "diana_flagstaff_maker_session";

/** Shared password for the private maker view. Set MAKER_PASSWORD in .env.local */
export function getMakerPassword(): string {
  return process.env.MAKER_PASSWORD || "DianasOrders!";
}

export async function isMakerAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(MAKER_COOKIE)?.value;
  if (!token) return false;
  return token === signMakerToken(getMakerPassword());
}

/** Lightweight signed token (not cryptographic auth: obscurity + shared password) */
export function signMakerToken(password: string): string {
  // Simple reversible-enough session marker for v1 local use
  return Buffer.from(`maker:${password}`).toString("base64url");
}

export function verifyMakerToken(token: string, password: string): boolean {
  return token === signMakerToken(password);
}
