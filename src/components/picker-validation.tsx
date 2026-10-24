"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/** Keep picker errors beside the options and bring the correction into view. */
export function PickerValidation({ error, children }: { error: string | null; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const errorId = useId();

  useEffect(() => {
    if (!error || !ref.current) return;
    const picker = ref.current;
    const control = picker.querySelector<HTMLElement>(
      'input:not(:disabled), [role="radio"]:not(:disabled), button[aria-pressed]:not(:disabled)'
    );
    const previousDescription = control?.getAttribute("aria-describedby");
    const previousInvalid = control?.getAttribute("aria-invalid");
    control?.setAttribute("aria-describedby", [previousDescription, errorId].filter(Boolean).join(" "));
    control?.setAttribute("aria-invalid", "true");
    (control ?? picker).focus({ preventScroll: true });
    picker.scrollIntoView({ block: "nearest", behavior: "instant" });
    return () => {
      if (!control) return;
      if (previousDescription === null) control.removeAttribute("aria-describedby");
      else if (previousDescription !== undefined) control.setAttribute("aria-describedby", previousDescription);
      if (previousInvalid === null) control.removeAttribute("aria-invalid");
      else if (previousInvalid !== undefined) control.setAttribute("aria-invalid", previousInvalid);
    };
  }, [error, errorId]);

  return (
    <div ref={ref} role="group" tabIndex={-1}
      aria-describedby={error ? errorId : undefined} className="min-w-0">
      {children}
      {error && (
        <p id={errorId} className="mt-2 text-left text-sm text-red-700 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
