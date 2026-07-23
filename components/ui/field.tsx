"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const controlStyles = [
  "w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 px-4 text-[0.9375rem]",
  "text-content placeholder:text-faint",
  "transition-[border-color,background-color,box-shadow] duration-300",
  "[transition-timing-function:var(--ease-out-quint)]",
  "hover:border-line-strong",
  "focus:border-[color-mix(in_oklab,var(--brand-primary)_60%,transparent)]",
  "focus:bg-[var(--surface-inset)]",
  "focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand-primary)_14%,transparent)]",
  "focus:outline-none",
  "aria-[invalid=true]:border-[#f87171]",
  "aria-[invalid=true]:focus:shadow-[0_0_0_4px_rgb(248_113_113/0.14)]",
];

export interface FieldProps {
  label: string;
  /** Rendered below the control and wired via aria-describedby. */
  error?: string;
  hint?: string;
  id: string;
  className?: string;
}

/** Label + control + message, with the aria wiring done once. */
export function Field({
  label,
  error,
  hint,
  id,
  className,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="font-mono text-eyebrow text-faint uppercase">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-[#f87171]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-faint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(controlStyles, "h-12", className)} {...props} />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(controlStyles, "min-h-36 resize-y py-3.5 leading-relaxed", className)}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
