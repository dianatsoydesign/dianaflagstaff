"use client";

import offlineCat from "@/data/animations/orange-cat-peeping.json";
import { useState } from "react";
import { NotFoundCat } from "@/components/not-found-cat";
import { Button } from "@/components/ui/button";
import { clearNetworkFailure, useConnectionUnavailable } from "@/lib/connection-status";

export function OfflineNotice({ compact = false }: { compact?: boolean }) {
  const unavailable = useConnectionUnavailable();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  async function retry() {
    setChecking(true);
    setMessage("");
    try {
      const response = await fetch("/api/connection", { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok || !navigator.onLine) throw new Error("Unavailable");
      clearNetworkFailure();
      document.getElementById(compact ? "cart-heading" : "main-content")?.focus();
    } catch {
      setMessage("Still unable to connect. Check your internet connection and try again.");
    } finally { setChecking(false); }
  }
  return (
    <div hidden={!unavailable} className={compact ? "mb-8" : "site-gutter py-12 sm:py-20"}>
      <section aria-label="Connection unavailable" className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 text-center">
        <div className={compact ? "w-full max-w-[240px]" : "w-full max-w-[280px]"}>
          <NotFoundCat animationData={offlineCat} aspectRatio="1440 / 2560" active={unavailable} />
        </div>
        <div className="flex w-full flex-col items-center">
          <h2 className={`font-display leading-[1.12] tracking-[-0.04em] text-ink ${compact ? "text-3xl" : "text-[clamp(2rem,4vw,3.5rem)]"}`}>Looks like the connection wandered off.</h2>
          <p role="status" className="mt-6 max-w-md text-lg leading-relaxed text-red-700 dark:text-red-400">{unavailable ? "Check your internet connection and try again. Your page and cart are still here." : ""}</p>
          <Button type="button" disabled={checking} onClick={retry} className="mt-8 h-12 rounded-full bg-button px-6 text-base text-button-foreground hover:bg-button-hover">{checking ? "Checking connection…" : "Try again"}</Button>
          {message && <p role="alert" className="mt-4 max-w-md text-left text-sm text-red-700 dark:text-red-400">{message}</p>}
        </div>
      </section>
    </div>
  );
}
