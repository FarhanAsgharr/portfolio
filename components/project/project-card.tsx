"use client";

import { ArrowUpRight, Maximize2 } from "lucide-react";
import Image from "next/image";

import { GitHubMark } from "@/components/icons/social";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Project } from "@/types";

/**
 * Project card.
 *
 * The whole card opens the detail modal; the GitHub and demo links sit above it
 * with their own stop-propagation, so a visitor can go straight to the source
 * without a detour. Metrics are on the card because the number is the reason to
 * click, not the screenshot.
 */
export function ProjectCard({
  project,
  onOpen,
  priority = false,
}: {
  project: Project;
  onOpen: () => void;
  priority?: boolean;
}) {
  return (
    <Card className="h-full">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`View details for ${project.title}`}
        className="flex h-full w-full flex-col text-left"
      >
        {/* Cover */}
        <div className="relative aspect-16/10 overflow-hidden bg-[var(--surface-inset)]">
          <Image
            src={project.cover}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out-quint)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,color-mix(in_oklab,var(--surface-card)_88%,transparent))]" />

          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge variant="primary">{project.category}</Badge>
            <Badge variant="outline" className="tabular-nums">
              {project.year}
            </Badge>
          </div>

          <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-lg border border-line bg-[var(--surface-card)]/70 text-faint opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
            <Maximize2 className="size-3.5" />
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-h3">{project.title}</h3>
          <p className="mt-2.5 line-clamp-3 text-[0.9375rem] leading-relaxed text-muted">
            {project.summary}
          </p>

          <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {project.metrics.slice(0, 3).map((metric) => (
              <div key={metric.label}>
                <dd className="font-display text-lg tracking-tight tabular-nums">{metric.value}</dd>
                <dt className="font-mono text-[0.625rem] tracking-wide text-faint uppercase">
                  {metric.label}
                </dt>
              </div>
            ))}
          </dl>

          <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
            {project.stack.slice(0, 4).map((tech) => (
              <li key={tech}>
                <Badge>{tech}</Badge>
              </li>
            ))}
            {project.stack.length > 4 ? (
              <li>
                <Badge variant="outline">+{project.stack.length - 4}</Badge>
              </li>
            ) : null}
          </ul>
        </div>
      </button>

      {/* Direct links, layered above the card button. */}
      <div className="absolute right-5 bottom-5 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        {project.github ? (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`${project.title} source on GitHub`}
            className="glass grid size-9 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-content"
          >
            <GitHubMark size={15} />
          </a>
        ) : null}
        {project.demo ? (
          <a
            href={project.demo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            aria-label={`${project.title} live demo`}
            className="glass grid size-9 place-items-center rounded-full text-muted transition-colors duration-300 hover:text-content"
          >
            <ArrowUpRight className="size-4" />
          </a>
        ) : null}
      </div>
    </Card>
  );
}
