"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { cn, getInitials } from "@/lib/utils";

const AUTOPLAY_MS = 7000;

/**
 * Testimonials carousel.
 *
 * One quote at a time, at a size worth reading. Autoplay pauses on hover and
 * focus and is skipped entirely for reduced-motion visitors; arrow keys work
 * because a carousel nobody can drive is just a slideshow.
 */
export function Testimonials() {
  const { testimonials } = useContent();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduced = usePrefersReducedMotion();

  const count = testimonials.length;

  const go = useCallback(
    (next: number, dir: number) => {
      if (count === 0) return;
      setDirection(dir);
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => go(index + 1, 1), [go, index]);
  const previous = useCallback(() => go(index - 1, -1), [go, index]);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [paused, reduced, next]);

  // The admin can delete testimonials while an index is already held, so clamp
  // rather than trusting it. Without this, removing the last few entries reads
  // past the end and crashes the section on `active.quote`.
  const safeIndex = count === 0 ? 0 : Math.min(index, count - 1);
  const active = testimonials[safeIndex];

  if (!active) return null;

  return (
    <Section id="testimonials">
      <SectionHeading
        node="words"
        title="What the people who paid for it said"
        align="center"
      />

      <Reveal>
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") next();
            if (event.key === "ArrowLeft") previous();
          }}
          tabIndex={0}
          className="relative mx-auto max-w-3xl rounded-2xl focus-visible:outline-2"
        >
          {/* Fixed min-height stops the section from jumping between quotes. */}
          <div className="relative min-h-[19rem] sm:min-h-[16rem]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.blockquote
                key={safeIndex}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <span
                  aria-hidden
                  className="font-display text-6xl leading-none text-primary/30 select-none"
                >
                  &ldquo;
                </span>

                <p className="mt-2 text-balance text-[1.25rem] leading-relaxed text-content sm:text-[1.4375rem]">
                  {active.quote}
                </p>

                <footer className="mt-8 flex items-center gap-3.5">
                  <span className="grid size-11 place-items-center rounded-full border border-line bg-[var(--surface-raised)] font-mono text-xs text-primary">
                    {getInitials(active.name)}
                  </span>
                  <div className="text-left">
                    <cite className="block text-sm font-medium text-content not-italic">
                      {active.name}
                    </cite>
                    <span className="text-sm text-muted">
                      {active.role}, {active.company}
                    </span>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous testimonial"
              className="glass grid size-10 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-content"
            >
              <ChevronLeft className="size-4" />
            </button>

            <ul className="flex items-center gap-2">
              {testimonials.map((testimonial, dotIndex) => (
                <li key={testimonial.name}>
                  <button
                    type="button"
                    onClick={() => go(dotIndex, dotIndex > safeIndex ? 1 : -1)}
                    aria-label={`Show testimonial ${dotIndex + 1} of ${testimonials.length}`}
                    aria-current={dotIndex === safeIndex}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      "[transition-timing-function:var(--ease-out-quint)]",
                      dotIndex === safeIndex
                        ? "w-7 bg-[var(--brand-primary)]"
                        : "w-1.5 bg-line-strong hover:bg-faint",
                    )}
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="glass grid size-10 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-content"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
