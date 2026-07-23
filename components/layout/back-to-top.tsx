"use client";

import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useState } from "react";

import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";

/** Appears once the visitor is a screen or so down the page. */
export function BackToTop() {
  const { scrollYProgress } = useScroll();
  const { scrollTo } = useSmoothScroll();
  const [shown, setShown] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setShown(value > 0.12);
  });

  return (
    <AnimatePresence>
      {shown ? (
        <motion.button
          type="button"
          onClick={() => scrollTo(0)}
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -3 }}
          className="glass fixed right-5 bottom-5 z-50 grid size-11 place-items-center rounded-full text-muted shadow-soft-md transition-colors duration-300 hover:text-content sm:right-8 sm:bottom-8"
        >
          <ArrowUp className="size-[1.05rem]" />
          <span className="sr-only">Back to top</span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
