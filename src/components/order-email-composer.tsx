"use client";

import { useRef, useState } from "react";
import type { Order } from "@/lib/order-types";
import { confirmedOrderEmail, readyForPickupEmail, type OrderEmailDraft } from "@/lib/order-emails";
import type { EmailKind, EmailRecord } from "@/lib/order-email-delivery";
import { isValidOrderEmail } from "@/lib/cart-field-limits";
import { formFieldInputClass } from "@/components/picker-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MailState = { ready: boolean; issues: string[]; records: EmailRecord[] };
const errorClass = "text-left text-sm text-red-700 dark:text-red-400";

export function OrderEmailComposer({ order }: { order: Order }) {
  const [kind, setKind] = useState<EmailKind>("confirmed");
  const [draftKind, setDraftKind] = useState<EmailKind>("confirmed");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [spot, setSpot] = useState(order.pickupPreference ?? "");
  const [draft, setDraft] = useState<OrderEmailDraft | null>(null);
  const [mail, setMail] = useState<MailState | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const preview = useRef<HTMLDivElement>(null);
  const sendLock = useRef(false);
  const inputClass = cn(formFieldInputClass, "h-12 w-full rounded-[8px]");

  async function loadHistory() {
    setLoading(true);
    try {
      const response = await fetch(`/api/maker/order-email?orderId=${encodeURIComponent(order.id)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load email history.");
      setMail(data);
      setError("");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not load email history.");
      setMail(null);
    } finally { setLoading(false); }
  }

  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (kind === "confirmed" && !date.trim()) errors.date = "Enter the estimated pickup date.";
    if (kind === "ready" && !time.trim()) errors.time = "Enter a proposed pickup date and time.";
    if (kind === "ready" && !spot.trim()) errors.spot = "Enter the pickup spot.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      const control = event.currentTarget.elements.namedItem(Object.keys(errors)[0]) as HTMLInputElement;
      control?.focus();
      control?.closest("label")?.scrollIntoView({ block: "nearest" });
      return;
    }
    setDraft(kind === "confirmed" ? confirmedOrderEmail(order, { estimatedPickupDate: date.trim() }) : readyForPickupEmail(order, { pickupTime: time.trim(), pickupSpot: spot.trim() }));
    setDraftKind(kind);
    setReviewing(false);
    setStatus("");
    setError("");
    requestAnimationFrame(() => { preview.current?.focus(); preview.current?.scrollIntoView({ block: "nearest" }); });
  }

  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(`To: ${draft.to}\nSubject: ${draft.subject}\n\n${draft.body}`);
      setStatus("Email draft copied.");
    } catch { setError("Could not copy. Select and copy the draft manually."); }
  }

  function restoreDraft(record: EmailRecord) {
    const saved = JSON.parse(record.payload) as OrderEmailDraft;
    setDraft({ to: saved.to, subject: saved.subject, body: saved.body });
    setDraftKind(record.kind);
    setReviewing(false);
    setError("");
    setStatus("Saved draft restored. Retry without changing its content.");
  }

  async function send() {
    if (!draft || sendLock.current) return;
    sendLock.current = true;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/maker/order-email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, kind: draftKind, ...draft }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send email.");
      setReviewing(false);
      setStatus(data.alreadySent ? "This email was already sent. No additional copy was sent." : "Email accepted by Resend for delivery.");
      await loadHistory();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not confirm sending. Refresh the history before retrying.");
    } finally {
      sendLock.current = false;
      setSending(false);
    }
  }

  const sent = mail?.records.find((record) => record.kind === draftKind && record.status === "accepted");
  const validDraft = !!draft && isValidOrderEmail(draft.to) && !!draft.subject.trim() && draft.subject.length <= 200 && !/[\r\n]/.test(draft.subject) && !!draft.body.trim() && draft.body.length <= 16000;
  const fieldError = (name: string) => fieldErrors[name] ? <span id={`${order.id}-${name}-error`} role="alert" className={errorClass}>{fieldErrors[name]}</span> : null;

  return (
    <details className="mt-5 border-t border-border pt-4" onToggle={(event) => { if (event.currentTarget.open && !mail && !loading) void loadHistory(); }}>
      <summary className="min-h-11 cursor-pointer py-3 font-medium">Customer emails</summary>
      <p className="mt-2 text-sm text-muted-foreground">Prepare a draft, review it, then send when you’re ready. Unsaved draft edits are lost if you leave or reload this page.</p>
      {mail && !mail.ready && (
        <div className="mt-4 rounded-[8px] border border-border p-3 text-sm">
          <p className="font-medium">Email setup needed. Drafts are available; direct sending is off.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">{mail.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
        </div>
      )}
      <div className="mt-4">
        <Button type="button" variant="outline" className="h-11 rounded-full" disabled={loading || sending} onClick={loadHistory}>{loading ? "Loading…" : "Refresh email history"}</Button>
        {mail?.records.length ? (
          <ul className="mt-3 space-y-3 text-sm">
            {mail.records.map((record) => (
              <li key={record.event_key} className="rounded-[8px] border border-border p-3">
                <p className="font-medium">{record.kind === "confirmed" ? "Order confirmation" : "Ready for pickup"}</p>
                <p>{record.status === "accepted" ? `Accepted for delivery ${new Date(record.accepted_at!).toLocaleString()}` : record.status === "rejected" ? "Rejected by email provider" : "Send attempt saved; delivery not confirmed"}</p>
                {record.status === "accepted" && <p className="text-muted-foreground">Delivery and bounce details are available in your Resend dashboard.</p>}
                {record.error && <p className={errorClass}>{record.error}</p>}
                {record.status !== "accepted" && <Button type="button" variant="outline" className="mt-2 h-11 rounded-full" onClick={() => restoreDraft(record)}>Restore saved draft</Button>}
              </li>
            ))}
          </ul>
        ) : mail ? <p className="mt-2 text-sm text-muted-foreground">No emails sent for this order.</p> : null}
      </div>
      <form noValidate onSubmit={prepare} className="mt-5 flex flex-col gap-5">
        <label className="flex flex-col gap-3 text-sm">
          <span>Email type (required)</span>
          <select className={inputClass} value={kind} onChange={(event) => setKind(event.target.value as EmailKind)} required>
            <option value="confirmed">Order confirmed and payment details</option><option value="ready">Ready for pickup</option>
          </select>
        </label>
        {kind === "confirmed" ? (
          <label className="flex flex-col gap-3 text-sm">
            <span>Estimated pickup date (required)</span>
            <input aria-label="Estimated pickup date (required)" name="date" aria-invalid={!!fieldErrors.date || undefined} aria-describedby={fieldErrors.date ? `${order.id}-date-error` : undefined} className={inputClass} value={date} maxLength={150} onChange={(event) => { setDate(event.target.value); setFieldErrors({}); }} placeholder="November 5, 2026" required />
            {fieldError("date")}
          </label>
        ) : (
          <>
            <label className="flex flex-col gap-3 text-sm">
              <span>Proposed pickup date and time (required)</span>
              <input aria-label="Proposed pickup date and time (required)" name="time" aria-invalid={!!fieldErrors.time || undefined} aria-describedby={fieldErrors.time ? `${order.id}-time-error` : undefined} className={inputClass} value={time} maxLength={150} onChange={(event) => { setTime(event.target.value); setFieldErrors({}); }} placeholder="Saturday, November 7 at 2 pm" required />
              {fieldError("time")}
            </label>
            <label className="flex flex-col gap-3 text-sm">
              <span>Pickup spot (required)</span>
              <input aria-label="Pickup spot (required)" name="spot" aria-invalid={!!fieldErrors.spot || undefined} aria-describedby={fieldErrors.spot ? `${order.id}-spot-error` : undefined} className={inputClass} value={spot} maxLength={200} onChange={(event) => { setSpot(event.target.value); setFieldErrors({}); }} required />
              {fieldError("spot")}
            </label>
          </>
        )}
        <Button type="submit" variant="outline" className="h-12 rounded-full" disabled={sending}>{draft ? "Create new draft" : "Create draft"}</Button>
        {draft && <p className="text-sm text-muted-foreground">Creating a new draft replaces edits below.</p>}
      </form>
      {draft && (
        <div ref={preview} tabIndex={-1} aria-label="Email draft" className="mt-6 flex flex-col gap-5">
          <p className="font-medium">{draftKind === "confirmed" ? "Order confirmation draft" : "Ready for pickup draft"}</p>
          <label className="flex flex-col gap-3 text-sm">
            <span>Recipient email (required)</span>
            <input aria-label="Recipient email (required)" type="email" readOnly className={inputClass} value={draft.to} required />
            {!isValidOrderEmail(draft.to) && <span className={errorClass}>This order needs a valid customer email before direct sending.</span>}
          </label>
          <label className="flex flex-col gap-3 text-sm">
            <span>Subject (required)</span>
            <input aria-label="Subject (required)" className={inputClass} disabled={sending || reviewing} value={draft.subject} maxLength={200} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} required />
            {(!draft.subject.trim() || /[\r\n]/.test(draft.subject)) && <span className={errorClass}>Enter a subject on one line.</span>}
          </label>
          <label className="flex flex-col gap-3 text-sm">
            <span>Message (required)</span>
            <textarea aria-label="Message (required)" rows={18} disabled={sending || reviewing} maxLength={16000} className={cn(formFieldInputClass, "w-full rounded-[8px] py-3 leading-relaxed")} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} required />
            {!draft.body.trim() && <span className={errorClass}>Enter the email message.</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="h-11 rounded-full" onClick={copyDraft}>Copy draft</Button>
            <Button type="button" className="h-11 rounded-full" disabled={!mail?.ready || !validDraft || !!sent || sending} onClick={() => setReviewing(true)}>{sent ? "Already sent" : draftKind === "confirmed" ? "Send confirmation" : "Send pickup email"}</Button>
          </div>
          {reviewing && !sent && (
            <div className="rounded-[8px] border border-border p-4">
              <p className="break-words text-sm">Send the reviewed {draftKind === "confirmed" ? "order confirmation" : "pickup email"} to <strong>{draft.to}</strong>?</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button type="button" className="h-11 rounded-full" disabled={sending || !mail?.ready || !validDraft} onClick={send}>{sending ? "Sending…" : "Send now"}</Button>
                <Button type="button" variant="outline" className="h-11 rounded-full" disabled={sending} onClick={() => setReviewing(false)}>Keep editing</Button>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">Customer replies go to dianatsoydesign@gmail.com. Sending an email does not change the order status or record a payment.</p>
        </div>
      )}
      <p role="status" className="mt-3 text-sm">{status}</p>
      {error && <p role="alert" className={cn(errorClass, "mt-3")}>{error}</p>}
    </details>
  );
}
