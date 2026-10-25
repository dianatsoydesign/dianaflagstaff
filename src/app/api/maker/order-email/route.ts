import { NextResponse } from "next/server";
import { Resend } from "resend";
import { isMakerAuthenticated } from "@/lib/maker-auth";
import { readOrders } from "@/lib/orders";
import { mailRuntime } from "@/lib/mail-runtime";
import { EmailSendError, sendOrderEmail, type EmailRecord } from "@/lib/order-email-delivery";
import { isValidOrderEmail } from "@/lib/cart-field-limits";

export async function GET(request: Request) {
  if (!(await isMakerAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const config = await mailRuntime();
    const orderId = new URL(request.url).searchParams.get("orderId");
    if (!orderId || orderId.length > 100) return NextResponse.json({ error: "Order ID required." }, { status: 400 });
    const records = config.database ? (await config.database.prepare("SELECT * FROM order_emails WHERE order_id = ? ORDER BY created_at DESC").bind(orderId).all<EmailRecord>()).results : [];
    return NextResponse.json({ ready: config.ready, issues: config.issues, records }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load email history. Check the database setup." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  try {
    const parsedOrigin = new URL(origin ?? "");
    // Next.js may normalize request.url to 0.0.0.0 behind the dev/proxy listener.
    sameOrigin = ["http:", "https:"].includes(parsedOrigin.protocol) && parsedOrigin.host === request.headers.get("host");
  } catch { /* Missing or invalid Origin is rejected. */ }
  if (!sameOrigin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  if (!(await isMakerAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const config = await mailRuntime();
    if (!config.ready || !config.database) return NextResponse.json({ error: "Email sending is not configured yet.", issues: config.issues }, { status: 503 });
    const raw = await request.text();
    if (raw.length > 24000) return NextResponse.json({ error: "Draft is too long." }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const { orderId, kind, to, subject, body: message } = body;
    if (typeof orderId !== "string" || orderId.length > 100 || !["confirmed", "ready"].includes(kind) || typeof to !== "string" || to.length > 254 || !isValidOrderEmail(to) || /[\r\n]/.test(to) || typeof subject !== "string" || !subject.trim() || subject.length > 200 || /[\r\n]/.test(subject) || typeof message !== "string" || !message.trim() || message.length > 16000) {
      return NextResponse.json({ error: "Check the recipient, subject (200 characters maximum), and message (16,000 characters maximum)." }, { status: 400 });
    }
    const order = (await readOrders()).find((entry) => entry.id === orderId);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (to.trim().toLowerCase() !== order.customerEmail?.trim().toLowerCase()) return NextResponse.json({ error: "Recipient must match this order's customer email." }, { status: 400 });
    const resend = new Resend(config.apiKey);
    const result = await sendOrderEmail(config.database, {
      async send(payload, key) {
        const { data, error } = await resend.emails.send({ from: payload.from, to: [payload.to], replyTo: payload.replyTo, subject: payload.subject, text: payload.body }, { idempotencyKey: key, signal: AbortSignal.timeout(15000) });
        return { id: data?.id, rejected: !!error && [400, 401, 403, 404, 422].includes(error.statusCode ?? 0) };
      },
    }, orderId, kind, { from: config.from, to: order.customerEmail!.trim(), subject: subject.trim(), body: message.trim(), replyTo: "dianatsoydesign@gmail.com" });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof EmailSendError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: "Could not finish sending. Refresh email history before retrying this draft." }, { status: 503 });
  }
}
