"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowUpRight, Copy, Check, Download } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { Icon } from "@/components/ui/icon";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { useContent } from "@/components/providers/content-provider";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useHasFinePointer, usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useTypewriter } from "@/hooks/use-typewriter";
import { cn } from "@/lib/utils";

/**
 * Three.js runs client-only and weighs more than the rest of the page combined,
 * so it is code-split and never enters the critical path.
 */
const ParticleField = dynamic(() => import("@/components/effects/particle-field"), {
  ssr: false,
});

const HEADLINE = ["Systems that", "think, ship,", "and hold up."];

/**
 * The hero states the thesis: this person builds AI systems that survive
 * production. The particle field is the most characteristic artefact of that
 * world — a latent space you can push around — so it opens the page.
 */
export function Hero() {
  const { profile, socials, stats } = useContent();
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  const { copied, copy } = useCopyToClipboard();
  const { text, isDeleting } = useTypewriter(profile.roles);

  const fine = useHasFinePointer();
  const reduced = usePrefersReducedMotion();
  const showField = fine && !reduced;

  // Parallax: content lifts and fades as the next section arrives.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20 sm:pt-32"
    >
      {showField ? (
        <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_70%_60%_at_60%_45%,#000_20%,transparent_75%)]">
          <ParticleField />
        </div>
      ) : null}

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container-page relative"
      >
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-20">
          {/* ---------------------------------------------------------- */}
          {/*  Left: the claim                                            */}
          {/* ---------------------------------------------------------- */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <Badge variant="primary" size="md" className="gap-2">
                <span className="relative flex size-1.5">
                  <span
                    className={cn(
                      "absolute inline-flex size-full rounded-full bg-[var(--brand-accent)]",
                      profile.availability.open && "animate-ping opacity-75",
                    )}
                  />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[var(--brand-accent)]" />
                </span>
                {profile.availability.label}
              </Badge>
            </motion.div>

            <h1 className="mt-7 text-display font-semibold">
              {HEADLINE.map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <motion.span
                    className={cn("block", index === 2 && "text-gradient")}
                    initial={{ y: "108%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 1,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.18 + index * 0.09,
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Name + rotating role, set in mono so it reads as a signature
                rather than competing with the headline. */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-sm"
            >
              <span className="text-content">{profile.name}</span>
              <span className="text-faint">/</span>
              <span className="text-primary">
                {text}
                <span
                  aria-hidden
                  className={cn(
                    "ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.15em] bg-[var(--brand-secondary)]",
                    !isDeleting && "animate-caret",
                  )}
                />
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.65 }}
              className="mt-6 max-w-xl text-lead text-muted"
            >
              {profile.bio}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Magnetic>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => scrollTo("contact")}
                  className="group"
                >
                  Hire me
                  <ArrowUpRight className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </Magnetic>

              <Magnetic>
                <Button asChild variant="glass" size="lg">
                  <a href={profile.resumeUrl} download>
                    <Download />
                    Résumé
                  </a>
                </Button>
              </Magnetic>

              <button
                type="button"
                onClick={() => copy(profile.email)}
                className="group flex h-13 items-center gap-2 rounded-full px-4 font-mono text-sm text-faint transition-colors duration-300 hover:text-content"
              >
                {copied ? (
                  <Check className="size-4 text-[var(--brand-secondary)]" />
                ) : (
                  <Copy className="size-4" />
                )}
                <span>{copied ? "Copied" : profile.email}</span>
              </button>
            </motion.div>

            {/* Socials */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-10 flex items-center gap-1"
            >
              {socials.map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="grid size-10 place-items-center rounded-full text-faint transition-colors duration-300 hover:text-content"
                  >
                    <Icon name={social.icon} className="size-[1.15rem]" />
                  </Link>
                </li>
              ))}
            </motion.ul>
          </div>

          {/* ---------------------------------------------------------- */}
          {/*  Right: portrait + the numbers that back the claim          */}
          {/* ---------------------------------------------------------- */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="hidden lg:block"
          >
            <Portrait />
          </motion.div>
        </div>

        {/* Headline numbers, sitting on the fold as supporting evidence. */}
        <motion.dl
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 1 }}
          className="mt-16 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-line pt-8 sm:mt-20 lg:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-eyebrow text-faint uppercase">{stat.label}</dt>
              <dd className="mt-2 font-display text-3xl tracking-tight tabular-nums">
                {stat.value}
                <span className="text-primary">{stat.suffix}</span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* Scroll cue */}
      <motion.button
        type="button"
        onClick={() => scrollTo("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        style={{ opacity: contentOpacity }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-faint transition-colors duration-300 hover:text-content sm:flex"
      >
        <span className="font-mono text-[0.625rem] tracking-[0.18em] uppercase">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="size-4" />
        </motion.span>
      </motion.button>
    </section>
  );
}

/**
 * Portrait, framed as a system node: a glass card with a live status strip.
 * The rotating conic ring echoes the logo mark in the navbar.
 */
function Portrait() {
  const { profile } = useContent();

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 animate-spin-slow rounded-[2.5rem] bg-[conic-gradient(from_0deg,transparent,color-mix(in_oklab,var(--brand-primary)_45%,transparent),transparent_35%,color-mix(in_oklab,var(--brand-secondary)_40%,transparent),transparent_70%)] opacity-45 blur-2xl"
      />

      <div className="glass relative w-[19rem] overflow-hidden rounded-2xl p-2 shadow-soft-lg">
        <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-[var(--surface-inset)]">
          <Image
            src={profile.avatar}
            alt={`${profile.name}, ${profile.role}`}
            fill
            priority
            sizes="19rem"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,color-mix(in_oklab,var(--surface-card)_92%,transparent))]" />
        </div>

        <div className="flex items-center justify-between gap-3 px-3 py-3.5">
          <div className="min-w-0">
            <p className="truncate font-mono text-[0.6875rem] tracking-wide text-faint uppercase">
              {profile.location}
            </p>
            <p className="mt-1 truncate text-sm text-content">{profile.timezone}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--brand-accent)_35%,transparent)] bg-[color-mix(in_oklab,var(--brand-accent)_12%,transparent)] px-2.5 py-1 font-mono text-[0.625rem] text-[var(--brand-accent)] uppercase">
            <span className="size-1.5 animate-pulse-glow rounded-full bg-current" />
            Open
          </span>
        </div>
      </div>
    </div>
  );
}
