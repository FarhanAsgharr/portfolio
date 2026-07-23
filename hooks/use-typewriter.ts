"use client";

import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "./use-media-query";

interface TypewriterOptions {
  typeSpeed?: number;
  deleteSpeed?: number;
  /** How long a completed phrase rests before deleting. */
  holdMs?: number;
}

interface TypewriterState {
  text: string;
  phraseIndex: number;
  isDeleting: boolean;
}

/**
 * Cycle a list of phrases with a type-and-delete effect.
 *
 * The whole cycle lives in one piece of state advanced from a single timeout,
 * so every transition — including "finished deleting, move to the next phrase"
 * — happens on a timer rather than synchronously during an effect. That keeps
 * it to one render per visible character.
 *
 * Reduced-motion visitors get the first phrase, statically.
 */
export function useTypewriter(
  phrases: string[],
  { typeSpeed = 55, deleteSpeed = 28, holdMs = 1900 }: TypewriterOptions = {},
) {
  const reduced = usePrefersReducedMotion();
  const [state, setState] = useState<TypewriterState>({
    text: "",
    phraseIndex: 0,
    isDeleting: false,
  });

  useEffect(() => {
    if (reduced || phrases.length === 0) return;

    const { text, phraseIndex, isDeleting } = state;
    const current = phrases[phraseIndex % phrases.length];

    // Phrase complete: rest before deleting. Deleted to nothing: advance.
    const delay = !isDeleting && text === current ? holdMs : isDeleting ? deleteSpeed : typeSpeed;

    const timer = setTimeout(() => {
      setState((previous) => {
        const phrase = phrases[previous.phraseIndex % phrases.length];

        if (!previous.isDeleting && previous.text === phrase) {
          return { ...previous, isDeleting: true };
        }

        if (previous.isDeleting && previous.text === "") {
          return {
            text: "",
            phraseIndex: (previous.phraseIndex + 1) % phrases.length,
            isDeleting: false,
          };
        }

        return {
          ...previous,
          text: previous.isDeleting
            ? phrase.slice(0, previous.text.length - 1)
            : phrase.slice(0, previous.text.length + 1),
        };
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [state, phrases, typeSpeed, deleteSpeed, holdMs, reduced]);

  if (reduced) return { text: phrases[0] ?? "", isDeleting: false };
  return { text: state.text, isDeleting: state.isDeleting };
}
