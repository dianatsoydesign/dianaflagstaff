import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { isMakerAuthenticated } from "@/lib/maker-auth";
import { MakerOrdersClient } from "@/components/maker-orders-client";

export const metadata: Metadata = {
  title: "Maker orders",
  robots: { index: false, follow: false },
};

async function MakerOrdersGate() {
  await connection();
  const authed = await isMakerAuthenticated();
  return <MakerOrdersClient initiallyAuthed={authed} />;
}

export default function MakerOrdersPage() {
  return (
    <div className="min-h-[70dvh] px-4 py-6 sm:px-6">
      <Suspense
        fallback={
          <p className="mx-auto mt-10 max-w-sm text-sm text-muted-foreground">
            Loading studio…
          </p>
        }
      >
        <MakerOrdersGate />
      </Suspense>
    </div>
  );
}
