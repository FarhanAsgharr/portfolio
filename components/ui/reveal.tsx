"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { createElement, type ComponentType, type ElementType, type ReactNode } from "react";

import { fadeUp, staggerContainer, viewportOnce } from "@/animations/variants";
import { cn } from "@/lib/utils";

/**
 * Reveal only ever wraps ordinary block elements (div, ul, li, section…), whose
 * motion props are structurally identical to a div's. Typing the cache this way
 * gives callers real prop checking instead of the `unknown` that
 * `motion.create()` returns for a dynamic tag.
 */
type MotionBlock = ComponentType<HTMLMotionProps<"div">>;

/**
 * `motion.create()` returns a new component type on every call, which React
 * treats as a different element and remounts. Cache per tag so a re-render of
 * the parent never tears down the animated subtree.
 */
const motionCache = new Map<ElementType, MotionBlock>();

function getMotionComponent(as: ElementType): MotionBlock {
  const cached = motionCache.get(as);
  if (cached) return cached;
  const created = motion.create(as as string) as MotionBlock;
  motionCache.set(as, created);
  return created;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Override the default fade-up. */
  variants?: Variants;
  delay?: number;
  as?: ElementType;
  /** Fire every time the element enters view rather than only the first time. */
  repeat?: boolean;
}

/**
 * Scroll-triggered reveal — the single entry point for "animate this in".
 *
 * Framer Motion honours `prefers-reduced-motion` for transform and opacity via
 * the `<MotionConfig reducedMotion="user">` in the root layout, so there is no
 * branch here.
 */
export function Reveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  as = "div",
  repeat = false,
}: RevealProps) {
  // `createElement` rather than JSX: the tag is resolved at runtime, and JSX
  // with a variable tag is exactly the pattern React's compiler lint flags as a
  // component created during render.
  return createElement(
    getMotionComponent(as),
    {
      className,
      variants,
      initial: "hidden",
      whileInView: "visible",
      viewport: repeat ? { ...viewportOnce, once: false } : viewportOnce,
      transition: { delay },
    },
    children,
  );
}

interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
  as?: ElementType;
}

/**
 * Parent for a set of `<RevealItem>`s. Children animate in sequence off one
 * viewport observer rather than one each, which keeps long lists cheap and the
 * cascade even.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delayChildren = 0,
  as = "div",
}: RevealGroupProps) {
  return createElement(
    getMotionComponent(as),
    {
      className,
      variants: staggerContainer(stagger, delayChildren),
      initial: "hidden",
      whileInView: "visible",
      viewport: viewportOnce,
    },
    children,
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  as?: ElementType;
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
  as = "div",
}: RevealItemProps) {
  return createElement(getMotionComponent(as), { className, variants }, children);
}

/**
 * Masked line reveal for headlines — each line slides out from behind a clip.
 * Takes an array so line breaks stay an authoring decision, not a guess.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  return (
    <span className={cn("block", className)}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className={cn("block", lineClassName)}
            initial={{ y: "110%" }}
            whileInView={{ y: "0%" }}
            viewport={viewportOnce}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + index * 0.08,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
