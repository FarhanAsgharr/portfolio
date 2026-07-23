"use client";

import { useEffect, useState } from "react";
import { animate, useInView } from "framer-motion";

import { usePrefersReducedMotion } from "./use-media-query";

/**
 * Count from zero to `target` the first time the element enters view.
 *
 * Returns the ref to attach and the value to display. Reduced-motion visitors
 * get the final number immediately — the information is the number, not the
 * animation — and that's returned by derivation rather than by setting state in
 * an effect, so there's no intermediate render showing a zero.
 */
export function useCounter(target: number, duration = 1.8) {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [animated, setAnimated] = useState(0);
  const reduced = usePrefersReducedMotion();

  // `useInView` takes a RefObject; wrap the callback ref's state in one.
  const inView = useInView({ current: element }, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!inView || reduced) return;

    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setAnimated(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, target, duration, reduced]);

  return { ref: setElement, value: reduced ? target : animated };
}
