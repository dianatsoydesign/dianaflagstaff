import { CareIconCircle } from "@/components/care-icon-circle";
import { cn } from "@/lib/utils";

/** Front-loading washer, used for the machine-washable note. */
export function MachineWashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-5 shrink-0", className)}
      aria-hidden
    >
      <rect x="1.25" y="1.25" width="17.5" height="17.5" rx="2.25" />
      <path d="M1.25 6.6h17.5" strokeLinecap="butt" />
      <circle cx="10" cy="13.15" r="3.55" />
      <circle cx="15.35" cy="3.9" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function MachineWashCircle({
  className,
  iconClassName,
  /** Height matches N lines of text-sm / leading-snug beside the icon. */
  lineCount = 3,
}: {
  className?: string;
  iconClassName?: string;
  lineCount?: number;
}) {
  return (
    <CareIconCircle
      lineCount={lineCount}
      className={className}
      iconClassName={iconClassName}
    >
      <MachineWashIcon className="size-full" />
    </CareIconCircle>
  );
}
