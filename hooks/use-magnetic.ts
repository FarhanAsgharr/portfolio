"use client";

import { useCallback, useRef } from "react";
import { useMotionValue, useSpring, type MotionValue } from "framer-motion";

import { useHasFinePointer, usePrefersReducedMotion } from "./use-media-query";

interface MagneticOptions {
  /** How far the element travels toward the pointer, as a fraction of offset. */
  strength?: number;
  /** Clamp on total travel in pixels. */
  maxDistance?: number;
}

interface MagneticBinding {
  ref: React.RefObject<HTMLElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  onPointerMove: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
}

/**
 * Pull an element toward the pointer while it hovers.
 *
 * Returns motion values rather than state so the animation never triggers a
 * React render. Disabled entirely for touch input and reduced-motion users,
 * where the values simply stay at zero.
 */
export function useMagnetic({
  strength = 0.35,
  maxDistance = 18,
}: MagneticOptions = {}): MagneticBinding {
  const ref = useRef<HTMLElement | null>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 220, damping: 20, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 220, damping: 20, mass: 0.5 });

  // Both hooks must run unconditionally — `&&` would short-circuit the second.
  const finePointer = useHasFinePointer();
  const reducedMotion = usePrefersReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (!enabled || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const offsetX = event.clientX - (rect.left + rect.width / 2);
      const offsetY = event.clientY - (rect.top + rect.height / 2);

      const nextX = Math.max(-maxDistance, Math.min(maxDistance, offsetX * strength));
      const nextY = Math.max(-maxDistance, Math.min(maxDistance, offsetY * strength));

      rawX.set(nextX);
      rawY.set(nextY);
    },
    [enabled, maxDistance, rawX, rawY, strength],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { ref, x, y, onPointerMove, onPointerLeave };
}
