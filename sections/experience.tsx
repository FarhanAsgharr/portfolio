"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { formatPeriod } from "@/lib/utils";

/**
 * Experience.
 *
 * A vertical timeline whose rail fills with scroll — the same device as the
 * page spine, at section scale. Here the order genuinely is a sequence, so the
 * rail is carrying real information rather than decorating.
 */
export function ExperienceTimeline() {
  const { experiences } = useContent();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 70%"],
  });

  // Springless: the rail should track the scroll exactly, not lag behind it.
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <Section id="experience">
      <SectionHeading
        node="experience"
        title="Where I've done it"
        description="Three chapters, each one a reaction to what the last one taught me."
      />

      <div ref={ref} className="relative pl-8 sm:pl-12">
        <span
          aria-hidden
          className="absolute top-3 bottom-3 left-[5px] w-px bg-line-strong sm:left-[9px]"
        />
        <motion.span
          aria-hidden
          style={{ scaleY: railScale }}
          className="absolute top-3 bottom-3 left-[5px] w-px origin-top bg-[linear-gradient(180deg,var(--brand-primary),var(--brand-secondary),var(--brand-accent))] sm:left-[9px]"
        />

        <ol className="flex flex-col gap-14 sm:gap-20">
          {experiences.map((item) => (
            <li key={`${item.company}-${item.start}`} className="relative">
              <Reveal>
                {/* Node */}
                <span
                  aria-hidden
                  className="absolute top-2 -left-8 grid size-[11px] place-items-center rounded-full border border-line-strong bg-[var(--surface-base)] sm:-left-12 sm:size-[19px]"
                >
                  <span className="hidden size-[7px] rounded-full bg-[var(--brand-primary)] sm:block" />
                </span>

                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  <span className="font-mono text-eyebrow text-faint uppercase tabular-nums">
                    {formatPeriod(item.start, item.end)}
                  </span>
                  <Badge variant={item.end ? "default" : "accent"}>
                    {item.end ? item.type : "Current"}
                  </Badge>
                  <span className="font-mono text-[0.6875rem] text-faint">{item.location}</span>
                </div>

                <h3 className="mt-3 text-h2">{item.role}</h3>
                <p className="mt-1.5 text-lead text-primary">{item.company}</p>
                <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
                  {item.summary}
                </p>

                <ul className="mt-6 flex max-w-2xl flex-col gap-3">
                  {item.achievements.map((achievement) => (
                    <li key={achievement} className="flex gap-3">
                      <Check className="mt-[5px] size-4 shrink-0 text-[var(--brand-secondary)]" />
                      <span className="text-[0.9375rem] leading-relaxed text-muted">
                        {achievement}
                      </span>
                    </li>
                  ))}
                </ul>

                <ul className="mt-6 flex flex-wrap gap-1.5">
                  {item.stack.map((tech) => (
                    <li key={tech}>
                      <Badge variant="outline">{tech}</Badge>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
