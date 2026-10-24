/** Shared cart form and order API character limits. */
export const CART_FIELD_LIMITS = {
  customerName: 100,
  customerEmail: 254,
  customerPhone: 40,
  pickupPreference: 200,
  customerNote: 1000,
} as const;

export function isValidOrderEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidOrderPhone(value: string): boolean {
  if (!value.trim()) return true;
  const digits = value.replace(/\D/g, "");
  return /^[+\d\s().-]+$/.test(value.trim()) && digits.length >= 7 && digits.length <= 15;
}
