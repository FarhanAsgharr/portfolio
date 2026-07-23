"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-medium rounded-full select-none",
    "transition-[transform,background-color,border-color,box-shadow,color] duration-300",
    "[transition-timing-function:var(--ease-out-quint)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** The one loud button. Reserve for the single primary action per view. */
        primary: [
          "text-white",
          "bg-[linear-gradient(100deg,var(--brand-primary),color-mix(in_oklab,var(--brand-secondary)_85%,var(--brand-primary)))]",
          "shadow-[0_8px_28px_-8px_color-mix(in_oklab,var(--brand-primary)_75%,transparent)]",
          "hover:shadow-[0_14px_44px_-10px_color-mix(in_oklab,var(--brand-primary)_85%,transparent)]",
          "hover:brightness-110",
        ],
        /** Frosted panel — the default for secondary actions on dark surfaces. */
        glass: [
          "glass text-content",
          "hover:border-[color-mix(in_oklab,var(--brand-primary)_45%,transparent)]",
          "hover:bg-[color-mix(in_oklab,var(--surface-raised)_70%,transparent)]",
        ],
        outline: [
          "border border-line-strong text-content bg-transparent",
          "hover:border-[color-mix(in_oklab,var(--brand-primary)_55%,transparent)]",
          "hover:text-primary",
        ],
        ghost: ["text-muted hover:text-content hover:bg-[var(--surface-raised)]"],
        /** For destructive-free icon affordances in dense toolbars. */
        subtle: ["bg-[var(--surface-raised)] text-muted hover:text-content"],
      },
      size: {
        sm: "h-9 px-4 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-[0.9375rem] [&_svg]:size-[1.05rem]",
        lg: "h-13 px-7 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-[1.15rem]",
        "icon-sm": "size-8 rounded-lg [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "glass", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. a Next.js `<Link>`) instead of a button. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : "button";
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
