"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { transitions } from "@/animations/variants";
import { cn } from "@/lib/utils";

/**
 * Animated modal built on Radix Dialog.
 *
 * Radix supplies focus trapping, escape handling, scroll locking and the aria
 * wiring; Framer supplies the transition. `forceMount` hands presence control to
 * `AnimatePresence` so the exit animation gets to finish before unmount.
 */
export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  /** Announced to screen readers; hidden visually when the body has its own heading. */
  title: string;
  description?: string;
  className?: string;
}) {
  const { setLocked } = useSmoothScroll();

  // Lenis keeps its own scroll loop running under Radix's body lock, so it has
  // to be paused explicitly or the page drifts behind the modal.
  useEffect(() => {
    setLocked(open);
    return () => setLocked(false);
  }, [open, setLocked]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-90 bg-[#03050f]/80 backdrop-blur-md"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                transition={transitions.softSpring}
                className={cn(
                  "fixed top-1/2 left-1/2 z-100 w-[min(56rem,calc(100vw-2rem))]",
                  "max-h-[min(46rem,calc(100dvh-2rem))] -translate-x-1/2 -translate-y-1/2",
                  "overflow-hidden rounded-2xl border border-line",
                  "bg-[var(--surface-card)]/95 shadow-soft-lg backdrop-blur-2xl",
                  className,
                )}
              >
                <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
                {description ? (
                  <DialogPrimitive.Description className="sr-only">
                    {description}
                  </DialogPrimitive.Description>
                ) : null}

                <DialogPrimitive.Close
                  className={cn(
                    "absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full",
                    "glass text-muted transition-colors duration-200",
                    "hover:text-content focus-visible:text-content",
                  )}
                >
                  <X className="size-4" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>

                <div className="max-h-[inherit] overflow-y-auto overscroll-contain">{children}</div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
