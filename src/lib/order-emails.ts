import type { Order } from "@/lib/order-types";
import { VENMO_HANDLE } from "@/data/products";

export type OrderEmailDraft = { to: string; subject: string; body: string };

const signature = "Warmly,\n\nDiana\ndianatsoydesign@gmail.com";

export function confirmedOrderEmail(
  order: Pick<Order, "customerName" | "customerEmail">,
  details: { estimatedPickupDate: string }
): OrderEmailDraft {
  return {
    to: order.customerEmail ?? "",
    subject: "Order Confirmed! 🧶 Your estimated pickup date + payment info",
    body: `Hi ${order.customerName},

Your order request is officially confirmed.

I've checked my yarn supply and queue, and I am so excited to start your crochet project!

💳 Next Step: Payment
For Venmo orders, I purchase yarn and reserve your queue spot once payment is received. Please include your name in the payment notes.

• Venmo: ${VENMO_HANDLE}
• Cash: Reply here to let me know you'd prefer to pay cash at pickup. Production begins once I confirm this arrangement.

🗓️ Your Estimated Pickup Date
Once payment is received (or your cash arrangement is confirmed), your order is estimated to be ready on or before:
${details.estimatedPickupDate}

I'll reach out as soon as it's ready to coordinate your local pickup!

Reply directly to this email if you have any questions.

${signature}`,
  };
}

export function readyForPickupEmail(
  order: Pick<Order, "customerName" | "customerEmail">,
  details: { pickupTime: string; pickupSpot: string }
): OrderEmailDraft {
  return {
    to: order.customerEmail ?? "",
    subject: "Your crochet project is ready! 🧶✨",
    body: `Hi ${order.customerName},

The final knot is tied and your handmade items are officially complete and looking beautiful!

📍 Picking Up Your Goods
Let's plan for ${details.pickupTime}. Please reply to confirm that this time works for you.

• Pickup Spot: ${details.pickupSpot}
• Paying Cash? If you chose the cash option, just bring exact change along.

I can’t wait for you to see your finished pieces! Let me know if we need to adjust the pickup time.

${signature}`,
  };
}
