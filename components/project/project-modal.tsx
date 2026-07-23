"use client";

import { ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { GitHubMark } from "@/components/icons/social";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Project } from "@/types";

/** Full project detail, without leaving the page. */
export function ProjectModal({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!project) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={project.title}
      description={project.summary}
    >
      <div className="relative aspect-21/9 w-full bg-[var(--surface-inset)]">
        <Image
          src={project.cover}
          alt=""
          fill
          sizes="56rem"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,var(--surface-card))]" />
      </div>

      <div className="px-6 pb-8 sm:px-9">
        <div className="-mt-10 flex flex-wrap items-center gap-1.5">
          <Badge variant="primary" size="md">
            {project.category}
          </Badge>
          <Badge variant="outline" size="md" className="tabular-nums">
            {project.year}
          </Badge>
        </div>

        <h2 className="mt-5 text-h2">{project.title}</h2>
        <p className="mt-4 max-w-2xl text-lead text-muted">{project.description}</p>

        {/* Metrics rail */}
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
          {project.metrics.map((metric) => (
            <div key={metric.label} className="bg-[var(--surface-card)] p-5">
              <dd className="font-display text-2xl tracking-tight tabular-nums">{metric.value}</dd>
              <dt className="mt-1 font-mono text-[0.625rem] tracking-wide text-faint uppercase">
                {metric.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="mt-9 grid gap-9 sm:grid-cols-2">
          <div>
            <h3 className="font-mono text-eyebrow text-faint uppercase">What it does</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {project.features.map((feature) => (
                <li key={feature} className="flex gap-2.5 text-[0.9375rem] leading-relaxed">
                  <Check className="mt-1 size-4 shrink-0 text-[var(--brand-secondary)]" />
                  <span className="text-muted">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-eyebrow text-faint uppercase">Built with</h3>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <li key={tech}>
                  <Badge size="md">{tech}</Badge>
                </li>
              ))}
            </ul>

            {project.caseStudy ? (
              <div className="mt-8">
                <h3 className="font-mono text-eyebrow text-faint uppercase">The problem</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
                  {project.caseStudy.problem}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link href={`/projects/${project.slug}`}>
              Read the case study
              <ArrowUpRight />
            </Link>
          </Button>

          {project.github ? (
            <Button asChild variant="glass">
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <GitHubMark size={16} />
                Source
              </a>
            </Button>
          ) : null}

          {project.demo ? (
            <Button asChild variant="outline">
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                Live demo
                <ArrowUpRight />
              </a>
            </Button>
          ) : null}
        </div>
      </div>
    </Dialog>
  );
}
