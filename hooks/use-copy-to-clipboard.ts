"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Copy text and report success for a short window, so a button can show a tick.
 * Falls back to `false` when the Clipboard API is unavailable or denied.
 */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch {
        setCopied(false);
        return false;
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
