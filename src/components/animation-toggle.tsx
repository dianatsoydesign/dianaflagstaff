"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnimationToggle({ playing, onClick }: { playing: boolean; onClick: () => void }) {
  const label = playing ? "Pause cat animation" : "Play cat animation";
  return <Button type="button" variant="ghost" size="icon" aria-label={label} title={label} className="absolute bottom-0 right-0 size-11 rounded-full text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground" onClick={onClick}>
    {playing ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
  </Button>;
}
