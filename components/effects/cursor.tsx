"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

import { useHasFinePointer, usePrefersReducedMotion } from "@/hooks/use-media-query";

/**
 * Two-part cursor: a dot that tracks the pointer exactly, and a ring that lags
 * behind on a spring. The ring grows and picks up the brand colour over
 * anything interactive.
 *
 * Only mounts for fine pointers with motion enabled. The native cursor is
 * hidden via a `data-custom-cursor` attribute on `<body>` rather than a blanket
 * CSS rule, so it comes back the moment this component isn't active.
 */
export function Cursor() {
  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const enabled = fine && !reduced;

  const [variant, setVariant] = useState<"default" | "interactive" | "text">("default");
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 380, damping: 34, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 380, damping: 34, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;

    document.body.dataset.customCursor = "on";

    function onMove(event: MouseEvent) {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);

      const target = event.target as HTMLElement | null;
      if (!target?.closest) return;

      if (target.closest("a, button, [role='button'], input, textarea, select, [data-cursor]")) {
        setVariant(target.closest("input, textarea") ? "text" : "interactive");
      } else {
        setVariant("default");
      }
    }

    function onLeave() {
      setVisible(false);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      delete document.body.dataset.customCursor;
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const ringSize = variant === "interactive" ? 48 : variant === "text" ? 4 : 30;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-1000">
      <motion.div
        style={{ x: ringX, y: ringY }}
        animate={{
          width: ringSize,
          height: ringSize,
          opacity: visible ? 1 : 0,
          borderRadius: variant === "text" ? 2 : 999,
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 border border-[color-mix(in_oklab,var(--brand-primary)_70%,transparent)] bg-[color-mix(in_oklab,var(--brand-primary)_10%,transparent)] backdrop-blur-[1px]"
      />
      <motion.div
        style={{ x, y }}
        animate={{ opacity: visible && variant !== "text" ? 1 : 0, scale: variant === "interactive" ? 0 : 1 }}
        transition={{ duration: 0.18 }}
        className="absolute top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand-secondary)]"
      />
    </div>
  );
}
