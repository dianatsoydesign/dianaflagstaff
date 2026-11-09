"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { navigationControlClass } from "@/lib/navigation-styles";

type Props = {
  className?: string;
  label?: string;
  /** Force light icons (e.g. over dark hero) */
  lightOnDark?: boolean;
};

export function ThemeToggle({ className, lightOnDark, label }: Props) {
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
        navigationControlClass(lightOnDark),
        "relative z-10 [&_svg]:pointer-events-none",
        label ? "min-h-11 w-full justify-between px-3 py-2" : "size-11",
        className
      )}
      style={{ cursor: "pointer" }}
      aria-label={`${label ? `${label}: ` : ""}${!mounted ? "Toggle color theme" : isDark ? "Switch to light mode" : "Switch to dark mode"}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
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
