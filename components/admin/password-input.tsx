"use client";

import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Password field with a show/hide toggle.
 *
 * Typing a long password blind is where most sign-in mistakes come from, so the
 * reveal is worth the small exposure risk on a personal device. The toggle is a
 * real button, labelled for screen readers, and its state resets to hidden on
 * unmount so a password is never left revealed on a re-render.
 */
export const PasswordInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 py-2.5 pr-11 pl-3.5",
            "text-[0.9375rem] text-content placeholder:text-faint",
            "transition-[border-color,box-shadow] duration-200",
            "hover:border-line-strong",
            "focus:border-[color-mix(in_oklab,var(--brand-primary)_60%,transparent)]",
            "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-primary)_14%,transparent)]",
            "focus:outline-none",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          // Not in the tab order: it's a convenience, and keeping it out keeps
          // Tab going password → submit without a detour.
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-md text-faint transition-colors hover:text-content"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";
