"use client";

import { FileUpload } from "@/components/admin/file-upload";
import { Repeatable, StringList } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel, AdminTextarea } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";
import type { Project, ProjectCategory } from "@/types";

const CATEGORIES: ProjectCategory[] = [
  "AI",
  "Web",
  "Full Stack",
  "Automation",
  "Mobile",
  "Open Source",
];

/** Turn a title into a URL-safe slug. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function emptyProject(): Project {
  return {
    slug: `project-${Date.now().toString(36)}`,
    title: "New project",
    summary: "",
    description: "",
    category: "Web",
    tags: [],
    stack: [],
    features: [],
    metrics: [],
    cover: "/images/projects/atlas.svg",
    year: new Date().getFullYear(),
    featured: false,
  };
}

/** The work section: cards, modals and each project's own page. */
export function ProjectsPanel({ content, patch }: PanelProps) {
  return (
    <AdminPanel
      title="Projects"
      description="Each one becomes a card in Work and gets its own page. Drag order with the arrows."
    >
      <Repeatable
        items={content.projects}
        onChange={(projects) => patch({ projects })}
        createItem={emptyProject}
        addLabel="Add a project"
        emptyLabel="No projects yet. Add your first one."
        summary={(item) => (
          <>
            {item.title} <span className="text-faint">· {item.category}</span>
          </>
        )}
        renderRow={(item, update) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Title">
                <AdminInput
                  value={item.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    // Keep the URL in step with the title until it's been
                    // customised — but never silently change a slug that was
                    // set deliberately, since that would break shared links.
                    const wasAuto = item.slug === slugify(item.title);
                    update(wasAuto ? { title, slug: slugify(title) } : { title });
                  }}
                />
              </AdminField>

              <AdminField label="Page address" hint="Appears as /projects/your-slug">
                <AdminInput
                  value={item.slug}
                  onChange={(e) => update({ slug: slugify(e.target.value) })}
                />
              </AdminField>

              <AdminField label="Category">
                <select
                  value={item.category}
                  onChange={(e) => update({ category: e.target.value as ProjectCategory })}
                  className="w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 px-3.5 py-2.5 text-[0.9375rem] text-content focus:outline-none"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Year">
                <AdminInput
                  type="number"
                  value={item.year}
                  onChange={(e) => update({ year: Number(e.target.value) || item.year })}
                />
              </AdminField>
            </div>

            <AdminField label="One-line summary" hint="Shown on the card.">
              <AdminTextarea
                rows={2}
                value={item.summary}
                onChange={(e) => update({ summary: e.target.value })}
              />
            </AdminField>

            <AdminField label="Full description" hint="Shown when someone opens the project.">
              <AdminTextarea
                rows={4}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </AdminField>

            <FileUpload
              assetId={`project-${item.slug}`}
              label="Cover image"
              currentUrl={item.cover}
              onUploaded={(cover) => update({ cover })}
              hint="Wide image, roughly 16:10. A screenshot of the real thing beats a mockup."
              maxDimension={1600}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Built with" hint="One per line, e.g. Next.js">
                <StringList value={item.stack} onChange={(stack) => update({ stack })} />
              </AdminField>

              <AdminField label="Focus tags" hint="One per line, e.g. RAG">
                <StringList value={item.tags} onChange={(tags) => update({ tags })} />
              </AdminField>
            </div>

            <AdminField label="What it does" hint="One feature per line.">
              <StringList value={item.features} onChange={(features) => update({ features })} />
            </AdminField>

            <AdminField
              label="Results"
              hint='One per line as "Label: value" — e.g. "Grounded accuracy: 94%". These are the numbers on the card.'
            >
              <StringList
                rows={4}
                value={item.metrics.map((metric) => `${metric.label}: ${metric.value}`)}
                onChange={(lines) =>
                  update({
                    metrics: lines
                      .map((line) => {
                        const at = line.indexOf(":");
                        if (at === -1) return { label: line.trim(), value: "" };
                        return {
                          label: line.slice(0, at).trim(),
                          value: line.slice(at + 1).trim(),
                        };
                      })
                      .filter((metric) => metric.label !== ""),
                  })
                }
              />
            </AdminField>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="GitHub link" hint="Leave empty to hide the button.">
                <AdminInput
                  value={item.github ?? ""}
                  onChange={(e) => update({ github: e.target.value || undefined })}
                />
              </AdminField>

              <AdminField label="Live demo link" hint="Leave empty to hide the button.">
                <AdminInput
                  value={item.demo ?? ""}
                  onChange={(e) => update({ demo: e.target.value || undefined })}
                />
              </AdminField>
            </div>

            <details className="rounded-lg border border-line px-4 py-3">
              <summary className="cursor-pointer text-sm text-muted">
                Case study (optional) — the long write-up on the project page
              </summary>
              <div className="mt-4 flex flex-col gap-4">
                <AdminField label="The problem">
                  <AdminTextarea
                    rows={3}
                    value={item.caseStudy?.problem ?? ""}
                    onChange={(e) =>
                      update({
                        caseStudy: {
                          problem: e.target.value,
                          approach: item.caseStudy?.approach ?? "",
                          outcome: item.caseStudy?.outcome ?? "",
                        },
                      })
                    }
                  />
                </AdminField>
                <AdminField label="What you did">
                  <AdminTextarea
                    rows={3}
                    value={item.caseStudy?.approach ?? ""}
                    onChange={(e) =>
                      update({
                        caseStudy: {
                          problem: item.caseStudy?.problem ?? "",
                          approach: e.target.value,
                          outcome: item.caseStudy?.outcome ?? "",
                        },
                      })
                    }
                  />
                </AdminField>
                <AdminField label="The result">
                  <AdminTextarea
                    rows={3}
                    value={item.caseStudy?.outcome ?? ""}
                    onChange={(e) =>
                      update({
                        caseStudy: {
                          problem: item.caseStudy?.problem ?? "",
                          approach: item.caseStudy?.approach ?? "",
                          outcome: e.target.value,
                        },
                      })
                    }
                  />
                </AdminField>
              </div>
            </details>
          </div>
        )}
      />
    </AdminPanel>
  );
}
