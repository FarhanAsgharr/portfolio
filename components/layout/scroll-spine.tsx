"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useMemo } from "react";

import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { useContent } from "@/components/providers/content-provider";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

/**
 * The site's signature element.
 *
 * A single vertical rail on the left edge carrying one node per section. It is
 * simultaneously the scroll progress indicator, the section navigation and a
 * diagram of the page's structure — three jobs one device does honestly,
 * because they're all answering "where am I in this?".
 *
 * Hidden below `xl` where there isn't margin to spare; the horizontal progress
 * bar and navbar cover the same ground on narrow screens.
 */
export function ScrollSpine() {
  const { spineSections } = useContent();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  const ids = useMemo(() => spineSections.map((section) => section.id), [spineSections]);
  const activeId = useScrollSpy(ids);
  const { scrollTo } = useSmoothScroll();

  return (
    <nav
      aria-label="Section navigation"
      className="fixed top-1/2 left-6 z-40 hidden -translate-y-1/2 xl:block"
    >
      <div className="relative flex flex-col gap-0.5">
        {/* Unlit rail */}
        <span
          aria-hidden
          className="absolute top-2 bottom-2 left-[5px] w-px bg-[linear-gradient(180deg,transparent,var(--line-strong)_12%,var(--line-strong)_88%,transparent)]"
        />
        {/* Lit rail — scaled by scroll progress from the top. */}
        <motion.span
          aria-hidden
          style={{ scaleY: progress }}
          className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-[linear-gradient(180deg,var(--brand-primary),var(--brand-secondary))]"
        />

        {spineSections.map((section) => {
          const isActive = activeId === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollTo(section.id)}
              aria-current={isActive ? "true" : undefined}
              className="group/node relative flex items-center gap-3 py-[7px] pl-0 text-left"
            >
              <span
                aria-hidden
                className={cn(
                  "relative z-10 size-[11px] shrink-0 rounded-full border transition-all duration-500",
                  "[transition-timing-function:var(--ease-out-quint)]",
                  isActive
                    ? "scale-110 border-transparent bg-[var(--brand-primary)] shadow-[0_0_0_4px_color-mix(in_oklab,var(--brand-primary)_18%,transparent)]"
                    : "border-line-strong bg-[var(--surface-base)] group-hover/node:border-[var(--brand-secondary)]",
                )}
              />

              <span
                className={cn(
                  "font-mono text-[0.625rem] tracking-[0.14em] uppercase",
                  "transition-all duration-400 [transition-timing-function:var(--ease-out-quint)]",
                  isActive
                    ? "translate-x-0 text-content opacity-100"
                    : "-translate-x-1 text-faint opacity-0 group-hover/node:translate-x-0 group-hover/node:opacity-100 group-focus-visible/node:translate-x-0 group-focus-visible/node:opacity-100",
                )}
              >
                {section.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * The narrow-screen counterpart: a hairline progress bar pinned to the very top
 * of the viewport.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: progress }}
      className="fixed inset-x-0 top-0 z-100 h-0.5 origin-left bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-secondary),var(--brand-accent))]"
    />
  );
}
