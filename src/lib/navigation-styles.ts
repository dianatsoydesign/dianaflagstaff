/** Shared feedback for navigation links and icon buttons. */
export function navigationControlClass(lightOnDark = false) {
  return [
    "inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-full px-3 text-base leading-snug opacity-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current",
    lightOnDark
      ? "text-white hover:bg-white/10 active:bg-white/15"
      : "text-ink hover:bg-wash active:bg-wash",
  ].join(" ");
}
