"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import type { AIProject } from "@/types";

/**
 * AI lab.
 *
 * Eight disciplines, each with the result it produced. The impact line is set
 * in the display face and given the most weight on the card — it's the only
 * thing on this section a hiring manager needs to read.
 */
export function AILab() {
  const { aiProjects } = useContent();
  return (
    <Section id="ai" className="relative">
      {/* A denser wash behind this section so it reads as its own chapter. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_oklab,var(--brand-primary)_9%,transparent),transparent)]"
      />

      <SectionHeading
        node="ai-lab"
        title={
          <>
            The AI work, <span className="text-gradient-brand">by discipline</span>
          </>
        }
        description="Every one of these is running somewhere with real users. The number under each is the outcome it was measured on."
      />

      <RevealGroup
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.05}
        as="ul"
      >
        {aiProjects.map((item) => (
          <RevealItem key={item.id} as="li">
            <DisciplineCard item={item} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}

function DisciplineCard({ item }: { item: AIProject }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-[var(--surface-inset)]/70 text-primary transition-colors duration-500 group-hover:border-[color-mix(in_oklab,var(--brand-primary)_40%,transparent)] group-hover:text-[var(--brand-secondary)]">
          <Icon name={item.icon} className="size-5" />
        </span>

        {item.href ? (
          <ArrowUpRight className="size-4 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-content" />
        ) : null}
      </div>

      <p className="mt-5 font-mono text-[0.625rem] tracking-[0.14em] text-faint uppercase">
        {item.discipline}
      </p>
      <h3 className="mt-2 text-[1.0625rem] leading-snug font-semibold tracking-tight">
        {item.title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-muted">{item.description}</p>

      {/* The result, given the weight it deserves. */}
      <p className="mt-5 border-t border-line pt-4 font-display text-[0.9375rem] leading-snug tracking-tight text-content">
        {item.impact}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {item.stack.slice(0, 3).map((tech) => (
          <li key={tech}>
            <Badge>{tech}</Badge>
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <Card tilt tiltStrength={5} className="h-full">
      {item.href ? (
        <Link href={item.href} className="flex h-full flex-col p-6">
          {body}
        </Link>
      ) : (
        <div className="flex h-full flex-col p-6">{body}</div>
      )}
    </Card>
  );
}
