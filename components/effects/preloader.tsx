"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

import { useContent } from "@/components/providers/content-provider";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

const SESSION_KEY = "portfolio:intro-played";

/**
 * Whether this session has already seen the intro.
 *
 * Read through `useSyncExternalStore` rather than an effect: the value genuinely
 * differs between the server snapshot (always "not yet seen", since there is no
 * sessionStorage) and the client's, which is exactly what this hook is for.
 */
const subscribe = () => () => {};
const hasPlayed = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null;
  } catch {
    // Private browsing modes can throw on storage access. Treat it as "played"
    // so a visitor never gets stuck behind an intro that can't record itself.
    return true;
  }
};
const hasPlayedOnServer = () => true;

/**
 * First-visit intro.
 *
 * Runs once per browser session — a loading screen on every navigation is an
 * obstacle, not an experience. Skipped entirely for reduced-motion visitors,
 * and it never blocks the page: content underneath is already rendered.
 */
export function Preloader() {
  const { profile } = useContent();
  const reduced = usePrefersReducedMotion();
  const played = useSyncExternalStore(subscribe, hasPlayed, hasPlayedOnServer);
  const [dismissed, setDismissed] = useState(false);
  const [progress, setProgress] = useState(0);

  const visible = !reduced && !played && !dismissed;

  useEffect(() => {
    if (!visible) return;

    document.body.style.overflow = "hidden";

    // Ease toward 100 rather than stepping linearly, so the bar decelerates.
    const interval = setInterval(() => {
      setProgress((current) => Math.min(100, current + Math.max(1, (100 - current) * 0.14)));
    }, 40);

    const timeout = setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage unavailable — the intro simply plays again next navigation.
      }
      setDismissed(true);
    }, 1750);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      document.body.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="preloader"
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-200 grid place-items-center bg-[var(--surface-base)]"
        >
          <div className="flex w-[min(22rem,80vw)] flex-col items-center gap-8">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-4xl tracking-tight"
            >
              <span className="text-gradient-brand">{profile.shortName}</span>
            </motion.span>

            <div className="w-full">
              <div className="h-px w-full overflow-hidden bg-line">
                <motion.div
                  className="h-full origin-left bg-[linear-gradient(90deg,var(--brand-primary),var(--brand-secondary))]"
                  style={{ scaleX: progress / 100 }}
                />
              </div>
              <div className="mt-3 flex justify-between font-mono text-[0.625rem] tracking-[0.16em] text-faint uppercase">
                <span>Loading</span>
                <span className="tabular-nums">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
