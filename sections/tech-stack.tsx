"use client";

import { Marquee } from "@/components/ui/marquee";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import type { TechItem } from "@/types";

/**
 * Tech stack.
 *
 * Set as wordmarks rather than logos. A wall of vendor logos is the default
 * answer here and it says nothing — every portfolio has the same fifteen. Type
 * set in the site's own mono, with each brand's colour carried by a single dot,
 * keeps the rail in the page's voice and still identifies everything at a
 * glance.
 */
export function TechStack() {
  const { techStack } = useContent();
  const half = Math.ceil(techStack.length / 2);
  const topRow = techStack.slice(0, half);
  const bottomRow = techStack.slice(half);

  return (
    <Section id="stack" containerClassName="max-w-none px-0">
      <div className="container-page">
        <SectionHeading
          node="stack"
          title="The daily toolkit"
          description="Everything here is something I've shipped with, not something I've tried."
          align="center"
        />
      </div>

      <Reveal className="flex flex-col gap-4">
        <Marquee durationSeconds={46}>
          {topRow.map((tech) => (
            <TechChip key={tech.name} tech={tech} />
          ))}
        </Marquee>
        <Marquee durationSeconds={54} reverse>
          {bottomRow.map((tech) => (
            <TechChip key={tech.name} tech={tech} />
          ))}
        </Marquee>
      </Reveal>
    </Section>
  );
}

function TechChip({ tech }: { tech: TechItem }) {
  return (
    <span
      className="group/chip mx-2 inline-flex items-center gap-3 rounded-full border border-line bg-[var(--surface-card)]/50 py-3 pr-6 pl-5 backdrop-blur-sm transition-colors duration-500 [transition-timing-function:var(--ease-out-quint)] hover:border-line-strong"
      style={{ "--tech": tech.color } as React.CSSProperties}
    >
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full transition-[box-shadow] duration-500 group-hover/chip:shadow-[0_0_14px_2px_var(--tech)]"
        style={{ backgroundColor: tech.color }}
      />
      <span className="font-mono text-sm whitespace-nowrap text-muted transition-colors duration-500 group-hover/chip:text-content">
        {tech.name}
      </span>
    </span>
  );
}
