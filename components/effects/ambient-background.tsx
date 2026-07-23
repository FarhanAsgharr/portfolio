"use client";

import { useScroll, useTransform, motion } from "framer-motion";

/**
 * The page's atmosphere: a masked grid, three drifting colour fields and a
 * grain overlay. Fixed and non-interactive — it sits behind everything and
 * parallaxes gently as the page scrolls.
 *
 * All three layers are pure CSS. Doing this with canvas would cost a repaint
 * per frame for something the compositor handles for free.
 */
export function AmbientBackground() {
  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const blobY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash — keeps the very top of the page from reading as flat black. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,color-mix(in_oklab,var(--brand-primary)_10%,transparent),transparent_60%)]" />

      <motion.div style={{ y: gridY }} className="grid-bg absolute inset-x-0 -top-1/4 h-[150%]" />

      <motion.div style={{ y: blobY }} className="absolute inset-0">
        <Blob className="-top-40 -left-32 size-[36rem] bg-[var(--brand-primary)]" delay="0s" />
        <Blob
          className="top-[38%] -right-40 size-[32rem] bg-[var(--brand-secondary)]"
          delay="-7s"
        />
        <Blob
          className="bottom-[6%] left-[18%] size-[28rem] bg-[var(--brand-accent)]"
          delay="-14s"
          opacity="opacity-[0.12] dark:opacity-[0.10]"
        />
      </motion.div>

      {/* Grain. An inline SVG data URI so it costs no request and no decode. */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette, so content near the edges keeps its contrast. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,var(--surface-base)_100%)] opacity-70" />
    </div>
  );
}

function Blob({
  className,
  delay,
  opacity = "opacity-[0.18] dark:opacity-[0.16]",
}: {
  className: string;
  delay: string;
  opacity?: string;
}) {
  return (
    <div
      className={`absolute animate-drift rounded-full blur-[110px] ${opacity} ${className}`}
      style={{ animationDelay: delay }}
    />
  );
}
