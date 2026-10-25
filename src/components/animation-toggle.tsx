"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnimationToggle({ playing, onClick, label = "cat animation" }: { playing: boolean; onClick: () => void; label?: string }) {
  const actionLabel = `${playing ? "Pause" : "Play"} ${label}`;
  return <Button type="button" variant="ghost" size="icon" aria-label={actionLabel} title={actionLabel} className="absolute bottom-0 right-0 size-11 rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground" onClick={onClick}>
    {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
  </Button>;
}
