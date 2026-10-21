"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Force light icons (e.g. over dark hero) */
  lightOnDark?: boolean;
};

export function ThemeToggle({ className, lightOnDark }: Props) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className={cn(
        "relative z-10 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-transparent opacity-85 transition-opacity hover:opacity-70 [&_svg]:pointer-events-none [&_*]:cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        lightOnDark ? "text-white" : "text-ink",
        className
      )}
      style={{ cursor: "pointer" }}
      aria-label={
        !mounted
          ? "Toggle color theme"
          : isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {/* Reserve space before mount to avoid layout shift */}
      {!mounted ? (
        <span className="size-5" aria-hidden />
      ) : isDark ? (
        <Sun className="size-5" strokeWidth={1.75} />
      ) : (
        <Moon className="size-5" strokeWidth={1.75} />
      )}
    </button>
  );
}
