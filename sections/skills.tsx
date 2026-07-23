"use client";

import { motion } from "framer-motion";

import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { cn } from "@/lib/utils";
import type { SkillGroup } from "@/types";

const accentToken: Record<SkillGroup["accent"], string> = {
  primary: "var(--brand-primary)",
  secondary: "var(--brand-secondary)",
  accent: "var(--brand-accent)",
};

/**
 * Skills.
 *
 * Nine categories, each a card with meters. The meter width is the claim and
 * the years are the evidence — showing both keeps a "95%" from being a number
 * with nothing behind it.
 */
export function Skills() {
  const { skillGroups } = useContent();
  return (
    <Section id="skills">
      <SectionHeading
        node="skills"
        title="What I reach for, and how often"
        description="Levels reflect what I'd be comfortable owning in production tomorrow — not what I've read about."
      />

      <RevealGroup
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        stagger={0.05}
        as="ul"
      >
        {skillGroups.map((group) => (
          <RevealItem key={group.category} as="li">
            <SkillCard group={group} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

function SkillCard({ group }: { group: SkillGroup }) {
  const accent = accentToken[group.accent];

  return (
    <Card tilt className="h-full p-6">
      <div className="flex items-start gap-3.5">
        <span
          className="grid size-10 shrink-0 place-items-center rounded-lg border"
          style={{
            borderColor: `color-mix(in oklab, ${accent} 30%, transparent)`,
            backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`,
            color: accent,
          }}
        >
          <Icon name={group.icon} className="size-[1.15rem]" />
        </span>
        <div className="min-w-0">
          <h3 className="text-[1.0625rem] font-semibold tracking-tight">{group.category}</h3>
          <p className="mt-1 text-sm text-muted">{group.summary}</p>
        </div>
      </div>

      <ul className="mt-6 flex flex-col gap-3.5">
        {group.skills.map((skill, index) => (
          <li key={skill.name}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm text-content">{skill.name}</span>
              <span className="shrink-0 font-mono text-[0.6875rem] text-faint tabular-nums">
                {skill.experience}
              </span>
            </div>

            <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[var(--surface-inset)]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, color-mix(in oklab, ${accent} 55%, transparent), ${accent})`,
                  // Grow from the left rather than sliding in from the centre.
                  originX: 0,
                }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: skill.level / 100 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  duration: 1.1,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1 + index * 0.06,
                }}
                role="meter"
                aria-valuenow={skill.level}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${skill.name} proficiency`}
              />
            </div>
          </li>
        ))}
      </ul>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-16 -bottom-16 size-40 rounded-full blur-3xl",
          "opacity-0 transition-opacity duration-700 group-hover:opacity-30",
        )}
        style={{ backgroundColor: accent }}
      />
    </Card>
  );
}
