"use client";

import { Check, X } from "lucide-react";

import { assessPassword } from "@/lib/password-policy";
import { cn } from "@/lib/utils";

/**
 * Strength bar plus a live checklist of the rules.
 *
 * The checklist matters more than the bar: "Strong" tells someone nothing about
 * what's still missing, whereas a rule that flips from ✕ to ✓ as they type
 * tells them exactly what to add. The bar is the at-a-glance summary on top.
 */
export function PasswordStrength({ password }: { password: string }) {
  const { checks, score, label, valid } = assessPassword(password);

  const barColor =
    score <= 1
      ? "var(--danger, #e0685e)"
      : score === 2
        ? "#d4a857"
        : score === 3
          ? "#8ab661"
          : "#2e9e7e";

  if (password.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-1.5 flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-full flex-1 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < score ? barColor : "var(--surface-inset)" }}
            />
          ))}
        </div>
        <span
          className="w-16 text-right font-mono text-[0.6875rem] tracking-wide"
          style={{ color: barColor }}
        >
          {label}
        </span>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              "flex items-center gap-1.5 text-xs transition-colors",
              check.passed ? "text-[var(--content-muted)]" : "text-faint",
            )}
          >
            <span
              className={cn(
                "grid size-3.5 shrink-0 place-items-center rounded-full",
                check.passed
                  ? "bg-[color-mix(in_oklab,#2e9e7e_28%,transparent)] text-[#54c79f]"
                  : "bg-[var(--surface-inset)] text-faint",
              )}
            >
              {check.passed ? <Check className="size-2.5" /> : <X className="size-2.5" />}
            </span>
            {check.label}
          </li>
        ))}
      </ul>

      {valid ? null : (
        <p className="sr-only" role="status">
          Password does not yet meet all requirements.
        </p>
      )}
    </div>
  );
}
