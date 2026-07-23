"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { seededRandom } from "@/lib/utils";

const WEEKS = 53;
const DAYS = 7;

/** Five buckets, from empty to busiest. */
const levelColor = [
  "var(--surface-inset)",
  "color-mix(in oklab, var(--brand-primary) 28%, transparent)",
  "color-mix(in oklab, var(--brand-primary) 52%, transparent)",
  "color-mix(in oklab, var(--brand-primary) 78%, transparent)",
  "var(--brand-secondary)",
];

/**
 * Contribution heatmap.
 *
 * Generated from a seeded PRNG rather than `Math.random()`, so the server and
 * client render byte-identical markup and React doesn't complain about a
 * hydration mismatch. Swap `cells` for a GitHub API response and nothing else
 * in this component changes.
 */
export function ContributionGraph({ total }: { total: number }) {
  const cells = useMemo(() => {
    const random = seededRandom("contributions-2025");

    return Array.from({ length: WEEKS * DAYS }, (_, index) => {
      const dayOfWeek = index % DAYS;
      // Weekends are quieter, and the recent months are busier than the old
      // ones — without that shape it reads as noise rather than a year of work.
      const weekendPenalty = dayOfWeek === 0 || dayOfWeek === 6 ? 0.45 : 1;
      const recency = 0.55 + (Math.floor(index / DAYS) / WEEKS) * 0.6;
      const roll = random() * weekendPenalty * recency;

      if (roll < 0.18) return 0;
      if (roll < 0.38) return 1;
      if (roll < 0.6) return 2;
      if (roll < 0.82) return 3;
      return 4;
    });
  }, []);

  return (
    <figure className="w-full">
      <div className="no-scrollbar overflow-x-auto">
        <div
          className="grid w-max grid-flow-col gap-[3px]"
          style={{ gridTemplateRows: `repeat(${DAYS}, minmax(0, 1fr))` }}
          role="img"
          aria-label={`${total.toLocaleString()} contributions in the last year`}
        >
          {cells.map((level, index) => (
            <motion.span
              key={index}
              className="size-[9px] rounded-[2px] sm:size-[11px]"
              style={{ backgroundColor: levelColor[level] }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{
                // Sweep left-to-right across the year rather than all at once.
                delay: Math.min(1.2, (index / (WEEKS * DAYS)) * 1.1),
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          ))}
        </div>
      </div>

      <figcaption className="mt-4 flex items-center justify-between gap-4 font-mono text-[0.625rem] tracking-wide text-faint uppercase">
        <span>{total.toLocaleString()} contributions this year</span>
        <span className="flex items-center gap-1.5">
          Less
          {levelColor.map((color) => (
            <span
              key={color}
              className="size-[9px] rounded-[2px]"
              style={{ backgroundColor: color }}
            />
          ))}
          More
        </span>
      </figcaption>
    </figure>
  );
}
