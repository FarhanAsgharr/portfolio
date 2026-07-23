"use client";

import { ArrowUpRight, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";

/**
 * Education & credentials.
 *
 * The degree gets the prose treatment; certificates are a dense list, because
 * that's what they are — a checklist, not a story.
 */
export function EducationSection() {
  const { certificates, education } = useContent();
  return (
    <Section id="education">
      <SectionHeading
        node="education"
        title="Learning, formal and otherwise"
        description="One degree and a running habit of finishing the course rather than bookmarking it."
      />

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-20">
        {/* Degree */}
        <div className="flex flex-col gap-6">
          {education.map((item) => (
            <Reveal key={item.institution}>
              <Card className="p-7 sm:p-8">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  <span className="font-mono text-eyebrow text-faint uppercase tabular-nums">
                    {item.start} — {item.end}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-faint">{item.location}</span>
                </div>

                <h3 className="mt-3 text-h3">
                  {item.qualification} {item.field}
                </h3>
                <p className="mt-1.5 text-primary">{item.institution}</p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">{item.detail}</p>

                <ul className="mt-6 flex flex-col gap-2.5">
                  {item.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2.5">
                      <Check className="mt-[5px] size-4 shrink-0 text-[var(--brand-secondary)]" />
                      <span className="text-sm text-muted">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          ))}
        </div>

        {/* Certificates */}
        <div>
          <Reveal>
            <p className="font-mono text-eyebrow text-faint uppercase">
              Certificates &amp; courses
            </p>
          </Reveal>

          <RevealGroup
            as="ul"
            stagger={0.05}
            className="mt-6 divide-y divide-[var(--line)] border-y border-line"
          >
            {certificates.map((certificate) => {
              const content = (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.9375rem] leading-snug font-medium text-content">
                      {certificate.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">{certificate.issuer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge className="tabular-nums">{certificate.year}</Badge>
                    {certificate.credentialUrl ? (
                      <ArrowUpRight className="size-4 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-content" />
                    ) : (
                      <span className="size-4" />
                    )}
                  </div>
                </>
              );

              return (
                <RevealItem as="li" key={certificate.name}>
                  {certificate.credentialUrl ? (
                    <a
                      href={certificate.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-4 py-4 transition-colors duration-300"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="group flex items-center gap-4 py-4">{content}</div>
                  )}
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>
      </div>
    </Section>
  );
}
