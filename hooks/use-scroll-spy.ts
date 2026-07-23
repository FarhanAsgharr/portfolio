"use client";

import { useEffect, useState } from "react";

/**
 * Track which section is currently in view.
 *
 * Drives both the navbar's active link and the spine's lit node. Uses a single
 * IntersectionObserver over all sections rather than one per section, and picks
 * the entry closest to the top of the viewport when several overlap.
 */
export function useScrollSpy(ids: string[], offset = 0.35) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActiveId(visible[0].target.id);
      },
      {
        // Shrink the observation band to a stripe near the top third of the
        // viewport so the active item changes when a section *arrives*, not
        // when it merely touches the edge.
        rootMargin: `-${Math.round(offset * 100)}% 0px -${Math.round((1 - offset - 0.15) * 100)}% 0px`,
        threshold: 0,
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, offset]);

  return activeId;
}
