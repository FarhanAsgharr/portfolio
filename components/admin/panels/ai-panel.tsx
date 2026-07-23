"use client";

import { Repeatable, StringList } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel, AdminTextarea } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";
import { iconRegistry } from "@/lib/icons";
import type { AIProject } from "@/types";

const ICONS = Object.keys(iconRegistry);

/** The AI Lab grid — one card per discipline. */
export function AiPanel({ content, patch }: PanelProps) {
  return (
    <AdminPanel
      title="AI Lab"
      description="Eight cards showing the kinds of AI work you do, each with the result it produced."
    >
      <Repeatable
        items={content.aiProjects}
        onChange={(aiProjects) => patch({ aiProjects })}
        addLabel="Add a discipline"
        createItem={() =>
          ({
            id: `ai-${Date.now().toString(36)}`,
            discipline: "AI Agents",
            title: "New capability",
            description: "",
            icon: "sparkles",
            stack: [],
            impact: "",
          }) as AIProject
        }
        summary={(item) => (
          <>
            {item.discipline} <span className="text-faint">· {item.title}</span>
          </>
        )}
        renderRow={(item, update) => (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Discipline" hint="The small label above the title.">
                <AdminInput
                  value={item.discipline}
                  onChange={(e) =>
                    update({ discipline: e.target.value as AIProject["discipline"] })
                  }
                />
              </AdminField>

              <AdminField label="Icon">
                <select
                  value={item.icon}
                  onChange={(e) => update({ icon: e.target.value })}
                  className="w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 px-3.5 py-2.5 text-[0.9375rem] text-content focus:outline-none"
                >
                  {ICONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <AdminField label="Title">
              <AdminInput value={item.title} onChange={(e) => update({ title: e.target.value })} />
            </AdminField>

            <AdminField label="Description">
              <AdminTextarea
                rows={3}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </AdminField>

            <AdminField
              label="The result"
              hint="The strongest line on the card — a number if you have one."
            >
              <AdminInput
                value={item.impact}
                onChange={(e) => update({ impact: e.target.value })}
              />
            </AdminField>

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Tools used" hint="One per line. First three are shown.">
                <StringList value={item.stack} onChange={(stack) => update({ stack })} rows={4} />
              </AdminField>

              <AdminField
                label="Links to"
                hint="Optional. e.g. /projects/your-slug — makes the card clickable."
              >
                <AdminInput
                  value={item.href ?? ""}
                  onChange={(e) => update({ href: e.target.value || undefined })}
                />
              </AdminField>
            </div>
          </div>
        )}
      />
    </AdminPanel>
  );
}
