import type { ReactNode } from "react";

import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/**
 * The section shell every part of the page uses.
 *
 * Owns vertical rhythm in one place so no section can drift, and renders the
 * mono node label that ties the content back to the spine on the left edge.
 */
export function Section({
  id,
  children,
  className,
  containerClassName,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section
      id={id}
      // `scroll-mt` keeps anchored navigation clear of the fixed navbar.
      className={cn("relative scroll-mt-24 py-(--spacing-section)", className)}
    >
      <div className={cn("container-page", containerClassName)}>{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  /** The spine node name, rendered as `~/skills`. */
  node: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Optional control rendered opposite the heading on wide screens. */
  action?: ReactNode;
}

export function SectionHeading({
  node,
  title,
  description,
  align = "left",
  className,
  action,
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "mb-14 flex flex-col gap-6 sm:mb-18",
        centered ? "items-center text-center" : "items-start",
        action && !centered && "lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn("max-w-2xl", centered && "flex flex-col items-center")}>
        <Reveal>
          <NodeLabel>{node}</NodeLabel>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mt-5 text-h2">{title}</h2>
        </Reveal>

        {description ? (
          <Reveal delay={0.12}>
            <p className="mt-5 text-lead text-muted">{description}</p>
          </Reveal>
        ) : null}
      </div>

      {action ? (
        <Reveal delay={0.18} className={cn(centered && "mt-2")}>
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}

/**
 * The recurring structural device: a monospace path label with a connector rule.
 * It names the section the way the spine does, so the two read as one system.
 */
export function NodeLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-mono text-eyebrow text-faint uppercase",
        className,
      )}
    >
      <span
        aria-hidden
        className="h-px w-8 bg-[linear-gradient(90deg,transparent,var(--brand-primary))]"
      />
      <span className="text-primary/90">~/</span>
      <span className="-ml-2.5">{children}</span>
    </span>
  );
}
