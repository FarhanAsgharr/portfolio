import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-mono tracking-wide whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-line bg-[var(--surface-raised)] text-muted",
        primary:
          "border-[color-mix(in_oklab,var(--brand-primary)_35%,transparent)] bg-[color-mix(in_oklab,var(--brand-primary)_12%,transparent)] text-[color-mix(in_oklab,var(--brand-primary)_60%,var(--content-primary))]",
        secondary:
          "border-[color-mix(in_oklab,var(--brand-secondary)_35%,transparent)] bg-[color-mix(in_oklab,var(--brand-secondary)_12%,transparent)] text-[color-mix(in_oklab,var(--brand-secondary)_60%,var(--content-primary))]",
        accent:
          "border-[color-mix(in_oklab,var(--brand-accent)_38%,transparent)] bg-[color-mix(in_oklab,var(--brand-accent)_14%,transparent)] text-[color-mix(in_oklab,var(--brand-accent)_60%,var(--content-primary))]",
        outline: "border-line-strong bg-transparent text-muted",
      },
      size: {
        sm: "px-2 py-0.5 text-[0.6875rem]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
