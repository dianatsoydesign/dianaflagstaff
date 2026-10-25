import type { OrderEmailDraft } from "@/lib/order-emails";
import type { EmailDatabase } from "@/lib/mail-runtime";

export type EmailKind = "confirmed" | "ready";
export type EmailPayload = OrderEmailDraft & { from: string; replyTo: string };
export type EmailRecord = {
  event_key: string; order_id: string; kind: EmailKind; payload: string;
  created_at: number; status: string; lease_until: number;
  provider_id: string | null; accepted_at: number | null;
  delivery_status: string | null; error: string | null;
};
export class EmailSendError extends Error {
  constructor(message: string, public status = 409) { super(message); }
}
export interface EmailProvider {
  send(payload: EmailPayload, key: string): Promise<{ id?: string; rejected?: boolean }>;
}

export async function sendOrderEmail(db: EmailDatabase, provider: EmailProvider, orderId: string, kind: EmailKind, payload: EmailPayload, now = Date.now()) {
  const key = `order/${orderId}/${kind}/v1`;
  const serialized = JSON.stringify(payload);
  await db.prepare("INSERT OR IGNORE INTO order_emails (event_key, order_id, kind, payload, created_at) VALUES (?, ?, ?, ?, ?)").bind(key, orderId, kind, serialized, now).run();
  const record = await db.prepare("SELECT * FROM order_emails WHERE event_key = ?").bind(key).first<EmailRecord>();
  if (!record) throw new EmailSendError("Could not reserve this email. Nothing was sent.", 503);
  if (record.status === "accepted") return { alreadySent: true, providerId: record.provider_id };
  if (record.payload !== serialized) throw new EmailSendError("An earlier attempt exists. Restore that saved draft before retrying.");
  // Resend keeps idempotency keys for 24h. Stop ambiguous retries before that expires.
  if (now - record.created_at >= 23 * 60 * 60 * 1000) throw new EmailSendError("This attempt needs a manual check in Resend before any further send. Automatic retry is blocked to prevent duplicates.");
  if (record.status === "rejected") throw new EmailSendError("Resend rejected this email. Check the provider dashboard and sender configuration before trying another email.");
  const claim = await db.prepare("UPDATE order_emails SET lease_until = ? WHERE event_key = ? AND status != 'accepted' AND lease_until <= ?").bind(now + 60000, key, now).run();
  if (!claim.meta.changes) throw new EmailSendError("This email is already being processed. Refresh its send history shortly.");
  let result: Awaited<ReturnType<EmailProvider["send"]>>;
  try {
    result = await provider.send(payload, key);
  } catch {
    await db.prepare("UPDATE order_emails SET status = 'retry', lease_until = 0, error = ? WHERE event_key = ? AND status != 'accepted'").bind("Delivery result unknown. Retry the same saved draft within 23 hours.", key).run();
    throw new EmailSendError("The delivery result is unknown. Retry this same draft safely; do not create a separate email.", 502);
  }
  if (!result.id) {
    const rejected = !!result.rejected;
    await db.prepare("UPDATE order_emails SET status = ?, lease_until = 0, error = ? WHERE event_key = ? AND status != 'accepted'").bind(rejected ? "rejected" : "retry", rejected ? "Provider rejected the request. Check sender configuration in Resend." : "Temporary provider failure. Retry the same draft.", key).run();
    throw new EmailSendError(rejected ? "Email rejected. Check your verified sender and Resend dashboard." : "Email service is temporarily unavailable. Retry the same draft.", 502);
  }
  // If this write fails, the reservation remains. The same key safely recovers the provider result.
  await db.prepare("UPDATE order_emails SET status = 'accepted', provider_id = ?, accepted_at = ?, delivery_status = 'sent', lease_until = 0, error = NULL WHERE event_key = ?").bind(result.id, now, key).run();
  return { alreadySent: false, providerId: result.id };
}
