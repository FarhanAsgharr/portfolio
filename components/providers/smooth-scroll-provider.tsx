"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

import { usePrefersReducedMotion } from "@/hooks/use-media-query";

interface SmoothScrollContextValue {
  /** Scroll to an element id or absolute offset. Works with or without Lenis. */
  scrollTo: (target: string | number, options?: { offset?: number; immediate?: boolean }) => void;
  /** Pause scrolling — used while a modal or the command palette is open. */
  setLocked: (locked: boolean) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue | null>(null);

export function useSmoothScroll() {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    throw new Error("useSmoothScroll must be used inside <SmoothScrollProvider>");
  }
  return context;
}

/**
 * Lenis-backed smooth scrolling.
 *
 * Lenis is only instantiated when the visitor hasn't asked for reduced motion;
 * otherwise `scrollTo` falls back to the native API and the page scrolls
 * normally. Either way the context contract is identical, so consumers never
 * branch on it.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Gentle exponential decay — the settle is what makes it feel expensive.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Native touch scrolling on mobile: hijacking it feels laggy and breaks
      // the platform's overscroll behaviour.
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    lenisRef.current = lenis;
    // Native `scroll-behavior: smooth` would fight Lenis; the class turns it off.
    document.documentElement.classList.add("lenis");

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis");
    };
  }, [reduced]);

  const scrollTo = useCallback<SmoothScrollContextValue["scrollTo"]>((target, options = {}) => {
    const { offset = -80, immediate = false } = options;
    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(typeof target === "string" ? `#${target.replace(/^#/, "")}` : target, {
        offset,
        immediate,
        duration: 1.2,
      });
      return;
    }

    // Reduced-motion path: jump without animation.
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "auto" });
      return;
    }
    const element = document.getElementById(target.replace(/^#/, ""));
    if (!element) return;
    window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY + offset });
  }, []);

  const setLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, []);

  const value = useMemo(() => ({ scrollTo, setLocked }), [scrollTo, setLocked]);

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}
