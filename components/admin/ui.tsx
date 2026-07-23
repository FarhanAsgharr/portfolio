"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Form primitives for the admin panel.
 *
 * Deliberately plainer than the marketing site's controls: this is a tool, used
 * for long stretches, where legibility and hit-target size matter more than
 * atmosphere. It shares the site's tokens so it still looks like the same
 * product.
 */

const control = [
  "w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 px-3.5 py-2.5",
  "text-[0.9375rem] text-content placeholder:text-faint",
  "transition-[border-color,box-shadow] duration-200",
  "hover:border-line-strong",
  "focus:border-[color-mix(in_oklab,var(--brand-primary)_60%,transparent)]",
  "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--brand-primary)_14%,transparent)]",
  "focus:outline-none",
];

export const AdminInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(control, className)} {...props} />
  ),
);
AdminInput.displayName = "AdminInput";

export const AdminTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(control, "min-h-24 resize-y leading-relaxed", className)} {...props} />
));
AdminTextarea.displayName = "AdminTextarea";

/** Label + control + optional hint, with the `for`/`id` wiring done once. */
export function AdminField({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-content">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs leading-relaxed text-faint">{hint}</p> : null}
    </div>
  );
}

/** A titled group of related fields. */
export function AdminPanel({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-[var(--surface-card)]/50 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[1.0625rem] font-semibold tracking-tight">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Small neutral button for row-level actions (add, remove, move). */
export function AdminButton({
  children,
  onClick,
  type = "button",
  tone = "neutral",
  disabled,
  className,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  tone?: "neutral" | "primary" | "danger";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
        "transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
        tone === "primary" &&
          "bg-[var(--brand-primary)] text-white hover:brightness-110",
        tone === "neutral" &&
          "border border-line bg-[var(--surface-raised)] text-muted hover:text-content",
        tone === "danger" &&
          "border border-[color-mix(in_oklab,#f87171_35%,transparent)] text-[#f87171] hover:bg-[color-mix(in_oklab,#f87171_10%,transparent)]",
        className,
      )}
    >
      {children}
    </button>
  );
}
