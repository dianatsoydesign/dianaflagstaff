"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button type="button" variant="outline" className={className} onClick={() => {
      if (window.history.length > 1) router.back();
      else router.replace("/");
    }}>
      Go back
    </Button>
  );
}
