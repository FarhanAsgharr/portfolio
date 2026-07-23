"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Infinite horizontal rail.
 *
 * The children are rendered twice and the track translates by exactly -50%, so
 * the loop point is seamless without measuring anything at runtime. Pauses on
 * hover so anything in the rail stays clickable.
 */
export function Marquee({
  children,
  className,
  durationSeconds = 40,
  reverse = false,
  pauseOnHover = true,
}: {
  children: ReactNode;
  className?: string;
  durationSeconds?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={cn("fade-x group relative w-full overflow-hidden", className)}>
      <div
        className={cn(
          "flex w-max animate-marquee items-center",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]",
        )}
        style={{ "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
