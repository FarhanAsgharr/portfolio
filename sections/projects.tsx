"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { ProjectCard } from "@/components/project/project-card";
import { ProjectModal } from "@/components/project/project-modal";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { cn } from "@/lib/utils";
import type { Project, ProjectCategory } from "@/types";

type Filter = ProjectCategory | "All";

/**
 * Featured work.
 *
 * Filter, search and a detail modal. Search is deferred so typing stays
 * responsive while the grid re-flows, and the layout animation is keyed on slug
 * so cards move rather than pop when the filter changes.
 */
export function Projects() {
  const { projects } = useContent();
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);

  const deferredQuery = useDeferredValue(query);

  // Derived from the content, so adding a project can never orphan a tab and
  // removing the last project of a category retires that tab automatically.
  const filters = useMemo<Filter[]>(
    () => ["All", ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects],
  );

  const visible = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();

    return projects.filter((project) => {
      if (filter !== "All" && project.category !== filter) return false;
      if (!needle) return true;

      return [project.title, project.summary, ...project.stack, ...project.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, deferredQuery, projects]);

  return (
    <Section id="work">
      <SectionHeading
        node="work"
        title="Selected work"
        description="Seven builds where the constraint was real — a latency budget, a compliance requirement, or a team that had already tried once."
        action={
          <div className="flex w-full items-center gap-2 lg:w-auto">
            <div className="relative flex-1 lg:w-64 lg:flex-none">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-faint" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search work"
                aria-label="Search projects"
                className="glass h-11 w-full rounded-full pr-9 pl-10 text-sm text-content placeholder:text-faint focus:border-[color-mix(in_oklab,var(--brand-primary)_55%,transparent)] focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-faint transition-colors hover:text-content"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        }
      />

      {/* Category filters */}
      <Reveal className="-mt-6 mb-10">
        <ul className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
          {filters.map((item) => {
            const isActive = filter === item;
            return (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={isActive}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors duration-300",
                    isActive ? "text-content" : "text-muted hover:text-content",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId="project-filter"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 rounded-full border border-line bg-[var(--surface-raised)]"
                    />
                  ) : null}
                  <span className="relative">{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Reveal>

      {/* Grid */}
      <motion.ul layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project, index) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectCard
                project={project}
                onOpen={() => setSelected(project)}
                priority={index < 3}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line py-20 text-center">
          <p className="text-muted">
            No work matches “{query}”
            {filter !== "All" ? ` in ${filter}` : ""}.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
            className="mt-3 text-sm text-primary underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      <ProjectModal
        project={selected}
        open={selected !== null}
        onOpenChange={(next) => {
          if (!next) setSelected(null);
        }}
      />
    </Section>
  );
}
