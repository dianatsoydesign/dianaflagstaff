"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SITE_URL } from "@/lib/social-sharing";


type Props = { title: string; path: string; label?: string; compact?: boolean };

export function SharePage({ title, path, label = "Share", compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const url = new URL(path, SITE_URL).href;
  const text = `${title} ${url}`;
  const linkClass = "flex min-h-11 items-center justify-center rounded-full border border-border px-4 text-sm text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  async function copy(instagram = false) {
    setError(""); setStatus("");
    try {
      await navigator.clipboard.writeText(url);
      setStatus(instagram ? "Link copied. Open Instagram and paste it into a message or a Story link sticker." : "Link copied to clipboard!");
    } catch {
      setError("Could not copy the link. Select and copy the address below.");
    }
  }

  async function deviceShare() {
    setError(""); setStatus("");
    if (typeof navigator.share !== "function") {
      setOpen(true);
      return;
    }
    try { await navigator.share({ title, url }); }
    catch (cause) {
      if (!(cause instanceof Error && cause.name === "AbortError")) {
        setOpen(true);
        setError("Could not open sharing. Choose an option below or copy the link.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setStatus(""); setError(""); }}>
      <DialogTrigger
        render={<Button type="button" variant="outline" className={compact ? "h-11 shrink-0 gap-2 px-3" : "h-12 gap-2 px-4"} />}
        onClick={(event) => {
          if (typeof navigator.share === "function") {
            event.preventDefault();
            void deviceShare();
          }
        }}
      >
        {compact && <Share2 aria-hidden="true" className="size-4" />}
        {label}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] rounded-[8px] overflow-y-auto text-left">
        <DialogTitle className="pr-8 text-lg">Share {title}</DialogTitle>
        <DialogDescription>Send a little handmade inspiration to someone.</DialogDescription>
        <Button variant="outline" className="min-h-11" onClick={deviceShare}>Share with an app…</Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => copy()}>{status === "Link copied to clipboard!" ? "Link copied!" : "Copy link"}</Button>
        <div className="grid grid-cols-2 gap-3">
          <a className={linkClass} href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp (opens in a new tab)">WhatsApp</a>
          <a className={linkClass} href={`sms:?body=${encodeURIComponent(text)}`}>SMS</a>
          <a className={linkClass} href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Facebook (opens in a new tab)">Facebook</a>
          <a className={linkClass} href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn (opens in a new tab)">LinkedIn</a>
          <a className={linkClass} href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`}>Email</a>
          <Button variant="outline" className="min-h-11" onClick={() => copy(true)}>Instagram: copy link</Button>
        </div>
        <p className="text-sm text-muted-foreground">For Instagram, copy the link and paste it into a message or a Story link sticker. Available apps and link previews depend on your device and app.</p>
        <label className="text-sm" htmlFor={`share-${path.replace(/[^a-z0-9]/gi, "-")}`}>Page link (optional)</label>
        <input id={`share-${path.replace(/[^a-z0-9]/gi, "-")}`} readOnly value={url} onFocus={(event) => event.currentTarget.select()} className="min-h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" />
        <p role="status" className="text-sm">{status}</p>
        {error && <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
