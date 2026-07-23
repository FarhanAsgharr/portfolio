"use client";

import { motion, useScroll } from "framer-motion";
import { useRef } from "react";

import { Counter } from "@/components/ui/counter";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { formatPeriod } from "@/lib/utils";

/**
 * About.
 *
 * Prose on the left, a compressed career timeline on the right. The timeline's
 * rail fills with scroll, which mirrors the spine on the page edge — same
 * device, smaller scale.
 */
export function About() {
  const { experiences, profile, stats } = useContent();
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 65%"],
  });

  return (
    <Section id="about">
      <SectionHeading
        node="about"
        title={
          <>
            The short version:{" "}
            <span className="text-muted">I care about the part that ships.</span>
          </>
        }
        description={profile.tagline}
      />

      <div className="grid gap-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-24">
        {/* Story */}
        <div>
          <RevealGroup className="flex flex-col gap-6" stagger={0.1}>
            {profile.story.map((paragraph, index) => (
              <RevealItem key={paragraph.slice(0, 32)}>
                <p
                  className={
                    index === 0
                      ? "text-lead text-content"
                      : "text-[1.0625rem] leading-relaxed text-muted"
                  }
                >
                  {paragraph}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>

          {/* Numbers with their context, not floating on their own. */}
          <RevealGroup
            className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2"
            stagger={0.06}
          >
            {stats.map((stat) => (
              <RevealItem key={stat.label} className="bg-[var(--surface-card)]/60 p-6">
                <div className="font-display text-4xl tracking-tight">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm font-medium text-content">{stat.label}</p>
                <p className="mt-1 text-sm text-muted">{stat.detail}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Compressed timeline */}
        <div>
          <Reveal>
            <p className="font-mono text-eyebrow text-faint uppercase">Journey</p>
          </Reveal>

          <div ref={timelineRef} className="relative mt-8 pl-8">
            <span aria-hidden className="absolute top-2 bottom-2 left-[5px] w-px bg-line-strong" />
            <motion.span
              aria-hidden
              style={{ scaleY: scrollYProgress }}
              className="absolute top-2 bottom-2 left-[5px] w-px origin-top bg-[linear-gradient(180deg,var(--brand-primary),var(--brand-secondary))]"
            />

            <ol className="flex flex-col gap-10">
              {experiences.map((item) => (
                <li key={`${item.company}-${item.start}`} className="relative">
                  <Reveal>
                    <span
                      aria-hidden
                      className="absolute top-[7px] -left-8 size-[11px] rounded-full border border-line-strong bg-[var(--surface-base)]"
                    />
                    <p className="font-mono text-eyebrow text-faint uppercase tabular-nums">
                      {formatPeriod(item.start, item.end)}
                    </p>
                    <h3 className="mt-2 text-h3">{item.role}</h3>
                    <p className="mt-1 text-sm text-primary">{item.company}</p>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                      {item.summary}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          <Reveal delay={0.1}>
            <blockquote className="mt-12 border-l-2 border-[var(--brand-primary)] pl-5">
              <p className="text-[1.0625rem] leading-relaxed text-content italic">
                “The mission hasn&apos;t changed since the first bug: understand the system well
                enough that the fix is obvious.”
              </p>
            </blockquote>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
