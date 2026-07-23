"use client";

import { useCounter } from "@/hooks/use-counter";
import { cn } from "@/lib/utils";

/**
 * Number that counts up the first time it scrolls into view.
 *
 * `tabular-nums` keeps the digits from shifting width mid-count, which is what
 * makes cheap counters feel jittery.
 */
export function Counter({
  value,
  prefix,
  suffix,
  className,
  duration,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const { ref, value: current } = useCounter(value, duration);

  return (
    <span
      ref={ref}
      className={cn("tabular-nums", className)}
      // Screen readers get the final value immediately rather than a stream of
      // intermediate numbers.
      aria-label={`${prefix ?? ""}${value}${suffix ?? ""}`}
    >
      <span aria-hidden>
        {prefix}
        {current}
        {suffix}
      </span>
    </span>
  );
}
