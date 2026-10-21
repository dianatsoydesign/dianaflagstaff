"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatAggregateLine,
  type AggregatedLine,
  type Order,
} from "@/lib/order-types";
import { formatPrice } from "@/data/products";
import { formatLineOptions } from "@/lib/line-options";
import { formFieldInputClass } from "@/components/picker-styles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MakerOrdersClient({ initiallyAuthed }: { initiallyAuthed: boolean }) {
  const [authed, setAuthed] = useState(initiallyAuthed);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [aggregate, setAggregate] = useState<AggregatedLine[]>([]);
  const [loading, setLoading] = useState(initiallyAuthed);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/maker/orders");
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError("Could not load orders");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as {
      orders: Order[];
      aggregate: AggregatedLine[];
    };
    setOrders(data.orders);
    setAggregate(data.aggregate);
    setAuthed(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initiallyAuthed) void load();
  }, [initiallyAuthed, load]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/maker/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("Incorrect password");
      return;
    }
    setPassword("");
    await load();
  }

  async function logout() {
    await fetch("/api/maker/login", { method: "DELETE" });
    setAuthed(false);
    setOrders([]);
    setAggregate([]);
  }

  async function setStatus(id: string, status: Order["status"]) {
    const res = await fetch("/api/maker/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) await load();
  }

  if (!authed) {
    return (
      <form
        onSubmit={login}
        className="mx-auto mt-10 max-w-sm rounded-xl border border-border bg-card/80 p-5"
      >
        <h1 className="font-display text-2xl text-ink">Maker studio</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Private order list. Customers never see this page. Enter the shared
          studio password.
        </p>
        <label className="mt-5 flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(formFieldInputClass, "h-12 w-full")}
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" className="mt-4 h-12 w-full">
          Unlock
        </Button>
      </form>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Private
          </p>
          <h1 className="font-display mt-1 text-3xl text-ink sm:text-4xl">
            Orders to make
          </h1>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="h-11" onClick={load}>
            Refresh
          </Button>
          <Button type="button" variant="ghost" className="h-11" onClick={logout}>
            Lock
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="font-display text-xl text-ink">Fulfillment scan</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Open requests rolled up by item · size · yarn
            </p>
            {aggregate.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No open lines yet.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-border/70 rounded-xl border border-border bg-card/70">
                {aggregate.map((line) => (
                  <li key={line.key} className="px-4 py-3 text-sm leading-snug">
                    {formatAggregateLine(line)}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-12">
            <h2 className="font-display text-xl text-ink">Requests</h2>
            {orders.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No requests submitted yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-xl border border-border bg-card/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString()} ·{" "}
                          {formatPrice(order.total)}
                        </p>
                      </div>
                      <span className="rounded-md bg-secondary px-2 py-1 text-xs capitalize">
                        {order.status.replace("_", " ")}
                      </span>
                    </div>
                    {order.pickupPreference && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Pickup: {order.pickupPreference}
                      </p>
                    )}
                    {order.customerNote && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Note: {order.customerNote}
                      </p>
                    )}
                    <ul className="mt-3 space-y-2 text-sm">
                      {order.lines.map((line, idx) => (
                        <li key={`${order.id}-${idx}`}>
                          {line.quantity} × {line.productName} ·{" "}
                          {formatLineOptions(line)}
                          {line.kind === "pattern_request" && (
                            <span className="block text-xs text-muted-foreground">
                              Pattern request
                              {line.patternName
                                ? `: ${line.patternName}`
                                : ""}
                              {line.designerName
                                ? ` by ${line.designerName}`
                                : ""}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(
                        [
                          ["new", "New"],
                          ["in_progress", "In progress"],
                          ["done", "Done"],
                        ] as const
                      ).map(([value, label]) => (
                        <Button
                          key={value}
                          type="button"
                          size="sm"
                          variant={order.status === value ? "default" : "outline"}
                          className="h-10"
                          onClick={() => setStatus(order.id, value)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
