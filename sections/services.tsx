"use client";

import { ArrowUpRight, Check } from "lucide-react";

import { Icon } from "@/components/ui/icon";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { Card } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";

/**
 * Services.
 *
 * Each card states what you get, not what I'm good at. Deliverables are listed
 * because "AI development" means nothing until it's three concrete artefacts.
 */
export function Services() {
  const { services } = useContent();
  const { scrollTo } = useSmoothScroll();

  return (
    <Section id="services">
      <SectionHeading
        node="services"
        title="How we could work together"
        description="Fixed-scope engagements with a written plan up front. If the scope should be smaller, I'll say so before we start."
      />

      <RevealGroup as="ul" stagger={0.05} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <RevealItem as="li" key={service.title}>
              <Card className="h-full">
                <button
                  type="button"
                  onClick={() => scrollTo("contact")}
                  className="flex h-full w-full flex-col p-7 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-xl border border-line bg-[var(--surface-inset)]/70 text-primary transition-colors duration-500 group-hover:text-[var(--brand-secondary)]">
                      <Icon name={service.icon} className="size-5" />
                    </span>
                    <ArrowUpRight className="size-4 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-content" />
                  </div>

                  <h3 className="mt-6 text-h3">{service.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                    {service.description}
                  </p>

                  <ul className="mt-6 flex flex-col gap-2.5">
                    {service.deliverables.map((deliverable) => (
                      <li key={deliverable} className="flex gap-2.5">
                        <Check className="mt-[5px] size-3.5 shrink-0 text-[var(--brand-secondary)]" />
                        <span className="text-sm text-muted">{deliverable}</span>
                      </li>
                    ))}
                  </ul>

                  {service.startingAt ? (
                    <p className="mt-auto pt-7 font-mono text-[0.6875rem] tracking-wide text-faint uppercase">
                      {service.startingAt}
                    </p>
                  ) : null}
                </button>
              </Card>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
