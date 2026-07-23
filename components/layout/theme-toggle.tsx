"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/lib/utils";

/**
 * Theme switch.
 *
 * The icon can't be decided until the client knows the resolved theme, so the
 * button renders at its final size with an empty well until mount — swapping in
 * an icon is invisible, whereas a layout shift is not.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "glass relative grid size-10 place-items-center overflow-hidden rounded-full",
        "text-muted transition-colors duration-300 hover:text-content",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted ? (
          <motion.span
            key={isDark ? "dark" : "light"}
            initial={{ opacity: 0, rotate: -60, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 60, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="grid place-items-center"
          >
            {isDark ? <Sun className="size-[1.05rem]" /> : <Moon className="size-[1.05rem]" />}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <span className="sr-only">
        {mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Switch theme"}
      </span>
    </button>
  );
}
