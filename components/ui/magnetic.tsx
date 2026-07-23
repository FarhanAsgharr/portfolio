"use client";

import { motion } from "framer-motion";
import type { ReactNode, Ref } from "react";

import { useMagnetic } from "@/hooks/use-magnetic";
import { cn } from "@/lib/utils";

/**
 * Wrap an interactive element so it drifts toward the pointer.
 *
 * The wrapper carries the transform rather than the child, so the child keeps
 * its own hover, focus and active styling untouched — and any element can be
 * wrapped without it needing to forward a ref.
 */
export function Magnetic({
  children,
  className,
  strength = 0.3,
  maxDistance = 16,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
  maxDistance?: number;
}) {
  const { ref, x, y, onPointerMove, onPointerLeave } = useMagnetic({ strength, maxDistance });

  return (
    <motion.span
      ref={ref as Ref<HTMLSpanElement>}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      className={cn("inline-flex", className)}
    >
      {children}
    </motion.span>
  );
}
