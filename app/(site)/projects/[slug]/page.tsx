import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GitHubMark } from "@/components/icons/social";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { NodeLabel } from "@/components/ui/section";
import { getContent } from "@/lib/content";
import { buildMetadata, buildProjectSchema } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) return buildMetadata(content, { title: "Project not found" });

  return buildMetadata(content, {
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}`,
    image: project.cover,
    type: "article",
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const others = content.projects.filter((item) => item.slug !== project.slug).slice(0, 3);

  return (
    <article className="pt-32 pb-(--spacing-section)">
      <div className="container-page">
        <Reveal>
          <Link
            href="/#work"
            className="group inline-flex items-center gap-2 font-mono text-eyebrow text-faint uppercase transition-colors duration-300 hover:text-content"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
            All work
          </Link>
        </Reveal>

        <header className="mt-10 max-w-3xl">
          <Reveal>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="primary" size="md">
                {project.category}
              </Badge>
              <Badge variant="outline" size="md" className="tabular-nums">
                {project.year}
              </Badge>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-6 text-h1">{project.title}</h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 text-lead text-muted">{project.description}</p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.demo ? (
                <Button asChild variant="primary">
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    Live demo
                    <ArrowUpRight />
                  </a>
                </Button>
              ) : null}
              {project.github ? (
                <Button asChild variant="glass">
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <GitHubMark size={16} />
                    Source
                  </a>
                </Button>
              ) : null}
            </div>
          </Reveal>
        </header>
      </div>

      {/* Cover — full-bleed, the one place this page raises its voice. */}
      <Reveal className="mt-14">
        <div className="container-page">
          <div className="relative aspect-21/9 overflow-hidden rounded-2xl border border-line bg-[var(--surface-inset)]">
            <Image
              src={project.cover}
              alt=""
              fill
              priority
              sizes="(max-width: 1280px) 100vw, 78rem"
              className="object-cover"
            />
          </div>
        </div>
      </Reveal>

      <div className="container-page mt-16">
        {/* Metrics */}
        <RevealGroup
          as="dl"
          stagger={0.06}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3"
        >
          {project.metrics.map((metric) => (
            <RevealItem key={metric.label} className="bg-[var(--surface-card)] p-6">
              <dd className="font-display text-3xl tracking-tight tabular-nums">{metric.value}</dd>
              <dt className="mt-1.5 font-mono text-[0.625rem] tracking-wide text-faint uppercase">
                {metric.label}
              </dt>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-16 grid gap-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-20">
          {/* Case study */}
          <div className="flex flex-col gap-12">
            {project.caseStudy ? (
              <>
                <CaseStudyBlock node="problem" title="The problem" body={project.caseStudy.problem} />
                <CaseStudyBlock node="approach" title="The approach" body={project.caseStudy.approach} />
                <CaseStudyBlock node="outcome" title="The outcome" body={project.caseStudy.outcome} />
              </>
            ) : (
              <CaseStudyBlock node="overview" title="Overview" body={project.description} />
            )}

            <div>
              <Reveal>
                <NodeLabel>features</NodeLabel>
              </Reveal>
              <RevealGroup as="ul" stagger={0.05} className="mt-6 flex flex-col gap-3.5">
                {project.features.map((feature) => (
                  <RevealItem as="li" key={feature} className="flex gap-3">
                    <Check className="mt-[5px] size-4 shrink-0 text-[var(--brand-secondary)]" />
                    <span className="text-[1.0625rem] leading-relaxed text-muted">{feature}</span>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <div className="rounded-xl border border-line bg-[var(--surface-card)]/60 p-6 backdrop-blur-xl">
                <p className="font-mono text-eyebrow text-faint uppercase">Built with</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.stack.map((tech) => (
                    <li key={tech}>
                      <Badge size="md">{tech}</Badge>
                    </li>
                  ))}
                </ul>

                <p className="mt-8 font-mono text-eyebrow text-faint uppercase">Focus</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="outline" size="md">
                        {tag}
                      </Badge>
                    </li>
                  ))}
                </ul>

                <Button asChild variant="glass" className="mt-8 w-full">
                  <Link href="/#contact">Discuss something similar</Link>
                </Button>
              </div>
            </Reveal>
          </aside>
        </div>

        {/* Next projects */}
        <div className="mt-24 border-t border-line pt-14">
          <Reveal>
            <NodeLabel>more-work</NodeLabel>
          </Reveal>

          <RevealGroup as="ul" stagger={0.06} className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((other) => (
              <RevealItem as="li" key={other.slug}>
                <Link
                  href={`/projects/${other.slug}`}
                  className="group block overflow-hidden rounded-xl border border-line bg-[var(--surface-card)]/60 transition-colors duration-500 hover:border-line-strong"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-[var(--surface-inset)]">
                    <Image
                      src={other.cover}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 25rem"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-[1.0625rem] font-semibold tracking-tight">{other.title}</h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted">{other.summary}</p>
                  </div>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProjectSchema(content, project)) }}
      />
    </article>
  );
}

function CaseStudyBlock({
  node,
  title,
  body,
}: {
  node: string;
  title: string;
  body: string;
}) {
  return (
    <section>
      <Reveal>
        <NodeLabel>{node}</NodeLabel>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="mt-5 text-h2">{title}</h2>
      </Reveal>
      <Reveal delay={0.12}>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted">{body}</p>
      </Reveal>
    </section>
  );
}
