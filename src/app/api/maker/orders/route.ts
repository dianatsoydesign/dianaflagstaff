import { NextResponse } from "next/server";
import {
  aggregateFulfillment,
  readOrders,
  updateOrderStatus,
} from "@/lib/orders";
import type { Order } from "@/lib/order-types";
import { isMakerAuthenticated } from "@/lib/maker-auth";

export async function GET() {
  if (!(await isMakerAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await readOrders();
  const aggregate = aggregateFulfillment(orders);
  return NextResponse.json({ orders, aggregate });
}

export async function PATCH(request: Request) {
  if (!(await isMakerAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    id?: string;
    status?: Order["status"];
  };
  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }
  if (!["new", "in_progress", "done"].includes(body.status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const order = await updateOrderStatus(body.id, body.status);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
