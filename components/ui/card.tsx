"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRef, type PointerEvent, type ReactNode } from "react";

import { useHasFinePointer, usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Follow the pointer with a soft radial highlight. */
  spotlight?: boolean;
  /** Tilt toward the pointer in 3D. */
  tilt?: boolean;
  /** Max rotation in degrees when tilt is on. */
  tiltStrength?: number;
}

/**
 * The card surface used across projects, services, skills and the AI lab.
 *
 * Spotlight and tilt are both pointer-driven and both write to motion values,
 * so neither causes a React render while the pointer moves. Both are disabled
 * for touch input and reduced-motion users — the card then behaves as a plain
 * glass panel with a hover border, which is the correct fallback.
 */
export function Card({
  children,
  className,
  spotlight = true,
  tilt = false,
  tiltStrength = 6,
}: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const interactive = fine && !reduced;

  // Spotlight position, in element-local pixels.
  const spotX = useMotionValue(-500);
  const spotY = useMotionValue(-500);

  // Tilt, springed so the card settles rather than snapping.
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 });

  const spotlightBackground = useMotionTemplate`radial-gradient(340px circle at ${spotX}px ${spotY}px, color-mix(in oklab, var(--brand-primary) 16%, transparent), transparent 72%)`;

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!interactive || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const localX = event.clientX - rect.left;
    const localY = event.clientY - rect.top;

    spotX.set(localX);
    spotY.set(localY);

    if (tilt) {
      // Normalise to [-0.5, 0.5] so rotation is symmetric about the centre.
      rotateY.set((localX / rect.width - 0.5) * tiltStrength * 2);
      rotateX.set(-(localY / rect.height - 0.5) * tiltStrength * 2);
    }
  }

  function handlePointerLeave() {
    spotX.set(-500);
    spotY.set(-500);
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={tilt && interactive ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      className={cn(
        "gradient-ring group relative overflow-hidden rounded-xl",
        "border border-line bg-[var(--surface-card)]/70 backdrop-blur-xl",
        "transition-[border-color,box-shadow] duration-500 [transition-timing-function:var(--ease-out-quint)]",
        "hover:shadow-soft-md",
        className,
      )}
    >
      {spotlight && interactive ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: spotlightBackground }}
        />
      ) : null}

      <div className="relative">{children}</div>
    </motion.div>
  );
}
