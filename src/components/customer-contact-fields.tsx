"use client";

import { CART_FIELD_LIMITS } from "@/lib/cart-field-limits";
import { formFieldInputClass } from "@/components/picker-styles";
import { cn } from "@/lib/utils";

type Props = {
  idPrefix: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  name: string;
  email: string;
  fieldErrors: { name?: string; email?: string };
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
};

/** Shared cart contact fields, including labels, limits, counters, and errors. */
export function CustomerContactFields({ idPrefix, name, email, fieldErrors, onNameChange, onEmailChange, namePlaceholder = "So I know who to meet", emailPlaceholder = "So you receive an order confirmation" }: Props) {
  return <>
              <div data-cart-field="name" className="flex scroll-my-4 flex-col gap-3 text-sm">
                <label htmlFor={`${idPrefix}-name`} className="font-medium">Your name (required)</label>
                <div className="relative">
                <input
                  id={`${idPrefix}-name`}
                  required
                  value={name}
                  onChange={(e) => { onNameChange(e.target.value); }}
                  maxLength={CART_FIELD_LIMITS.customerName}
                  aria-invalid={!!fieldErrors.name || undefined}
                  aria-describedby={`${idPrefix}-name-count${fieldErrors.name ? ` ${idPrefix}-name-error` : ""}`}
                  autoComplete="name"
                  className={cn(formFieldInputClass, "h-12 w-full rounded-[8px] pr-20")}
                  placeholder={namePlaceholder}
                />
                  {name.length > 0 && (
                <p id={`${idPrefix}-name-count`} className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums", name.length >= CART_FIELD_LIMITS.customerName ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
                  {name.length} / {CART_FIELD_LIMITS.customerName}
                </p>
                  )}
                </div>
                {fieldErrors.name && (
                  <p id={`${idPrefix}-name-error`} role="alert" className="text-left text-sm text-red-700 dark:text-red-400">
                    {fieldErrors.name}
                  </p>
                )}
                <span className="sr-only" role="status">
                  {name.length >= CART_FIELD_LIMITS.customerName ? "Character limit reached." : ""}
                </span>
              </div>
              <div data-cart-field="email" className="flex scroll-my-4 flex-col gap-3 text-sm">
                <label htmlFor={`${idPrefix}-email`} className="font-medium">Email address (required)</label>
                <div className="relative">
                <input
                  id={`${idPrefix}-email`}
                  placeholder={emailPlaceholder}
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => { onEmailChange(e.target.value); }}
                  maxLength={CART_FIELD_LIMITS.customerEmail}
                  aria-invalid={!!fieldErrors.email || undefined}
                  aria-describedby={`${idPrefix}-email-count${fieldErrors.email ? ` ${idPrefix}-email-error` : ""}`}
                  className={cn(formFieldInputClass, "h-12 w-full rounded-[8px] pr-20")}
                />
                  {email.length > 0 && (
                <p id={`${idPrefix}-email-count`} className={cn("pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs tabular-nums", email.length >= CART_FIELD_LIMITS.customerEmail ? "text-red-700 dark:text-red-400" : "text-muted-foreground")}>
                  {email.length} / {CART_FIELD_LIMITS.customerEmail}
                </p>
                  )}
                </div>
                {fieldErrors.email && (
                  <p id={`${idPrefix}-email-error`} role="alert" className="text-left text-sm text-red-700 dark:text-red-400">
                    {fieldErrors.email}
                  </p>
                )}
              </div>
  </>;
}
