import type { Transition, Variants } from "framer-motion";

/**
 * Shared motion vocabulary.
 *
 * Every section reveals with the same easing and distance so the page reads as
 * one system rather than a collection of separately animated components. If a
 * component needs a different feel, it should compose these rather than invent
 * a new curve.
 */

/* -------------------------------------------------------------------------- */
/*  Easings & transitions                                                     */
/* -------------------------------------------------------------------------- */

/** The house curve: fast start, long settle. Matches --ease-out-expo in CSS. */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeOutQuint = [0.22, 1, 0.36, 1] as const;

export const transitions = {
  /** Default reveal. */
  reveal: { duration: 0.7, ease: easeOutExpo } satisfies Transition,
  /** Snappier, for hover and press states. */
  micro: { duration: 0.28, ease: easeOutQuint } satisfies Transition,
  /** Physical feel for draggable / magnetic elements. */
  spring: { type: "spring", stiffness: 260, damping: 26, mass: 0.6 } satisfies Transition,
  /** Softer spring for large surfaces like modals. */
  softSpring: { type: "spring", stiffness: 190, damping: 24 } satisfies Transition,
} as const;

/* -------------------------------------------------------------------------- */
/*  Reveals                                                                   */
/* -------------------------------------------------------------------------- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.reveal },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.reveal },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.reveal },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: transitions.reveal },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: transitions.reveal },
};

/** Clip-path wipe — used for the hero headline lines. */
export const maskReveal: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 0.9, ease: easeOutExpo } },
};

/* -------------------------------------------------------------------------- */
/*  Orchestration                                                             */
/* -------------------------------------------------------------------------- */

/** Parent that staggers its children. Pair with any reveal variant above. */
export function staggerContainer(stagger = 0.07, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** Standard viewport config: fire once, slightly before the element is centred. */
export const viewportOnce = { once: true, amount: 0.25, margin: "0px 0px -80px 0px" } as const;

/** For tall sections where 25% of the element is still most of the screen. */
export const viewportTall = { once: true, amount: 0.12, margin: "0px 0px -60px 0px" } as const;
