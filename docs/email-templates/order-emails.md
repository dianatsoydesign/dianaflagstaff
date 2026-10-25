# Customer email drafts

Draft generators: `src/lib/order-emails.ts`.

## Order confirmed and payment details

- Customer name and email come from the order.
- Venmo comes from the shared website setting, currently @diana-flagstaff.
- Diana supplies the estimated pickup date before preparing the draft.
- Cash pickup requires a confirmed arrangement before production starts.

## Ready for pickup

- Customer name and email come from the order.
- Diana supplies the pickup time and pickup spot before preparing the draft.
- The cart pickup preference is a location, not a scheduled time. Do not describe it as an agreed appointment.

These functions prepare text only. They do not send messages, approve orders, record payment, or change order status.

## Direct sending

The maker editor now also supports authenticated server-side delivery through Resend after configuration. See `setup.md` for the database, verified sender, private secrets, and activation steps. Draft generation itself remains separate from sending.
