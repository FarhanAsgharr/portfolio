"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query.
 *
 * Uses `useSyncExternalStore` so the server snapshot is explicit (`false`)
 * rather than a `useEffect` flash — the first client paint already matches.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True when the pointer is a real mouse — gates cursor and tilt effects. */
export function useHasFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/** True when the visitor has asked the OS to reduce motion. */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}
