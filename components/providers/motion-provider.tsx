"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * `reducedMotion="user"` makes every Framer animation on the site respect the
 * OS setting automatically: transforms and opacity are skipped, layout stays
 * intact. Setting it once here means no component has to remember to check.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
