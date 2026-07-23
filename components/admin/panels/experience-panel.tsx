"use client";

import { Repeatable, StringList } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel, AdminTextarea } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";
import type { Experience } from "@/types";

const TYPES: Experience["type"][] = ["Full-time", "Contract", "Freelance", "Internship"];

/** Work history — the timeline in the Experience section. */
export function ExperiencePanel({ content, patch }: PanelProps) {
  return (
    <AdminPanel
      title="Work history"
      description="Newest first. Leave the end year empty for your current job — it shows as “Present”."
    >
      <Repeatable
        items={content.experiences}
        onChange={(experiences) => patch({ experiences })}
        addLabel="Add a job"
        createItem={(): Experience => ({
          company: "New company",
          role: "Your role",
          type: "Full-time",
          location: "Remote",
          start: String(new Date().getFullYear()),
          summary: "",
          achievements: [],
          stack: [],
        })}
        summary={(item) => (
          <>
            {item.role} <span className="text-faint">· {item.company}</span>
          </>
        )}
        renderRow={(item, update) => (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Job title">
                <AdminInput value={item.role} onChange={(e) => update({ role: e.target.value })} />
              </AdminField>

              <AdminField label="Company">
                <AdminInput
                  value={item.company}
                  onChange={(e) => update({ company: e.target.value })}
                />
              </AdminField>

              <AdminField label="Start year">
                <AdminInput
                  value={item.start}
                  onChange={(e) => update({ start: e.target.value })}
                />
              </AdminField>

              <AdminField label="End year" hint="Leave empty if this is your current job.">
                <AdminInput
                  value={item.end ?? ""}
                  placeholder="Present"
                  onChange={(e) => update({ end: e.target.value || undefined })}
                />
              </AdminField>

              <AdminField label="Type">
                <select
                  value={item.type}
                  onChange={(e) => update({ type: e.target.value as Experience["type"] })}
                  className="w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 px-3.5 py-2.5 text-[0.9375rem] text-content focus:outline-none"
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField label="Location">
                <AdminInput
                  value={item.location}
                  onChange={(e) => update({ location: e.target.value })}
                />
              </AdminField>
            </div>

            <AdminField label="Summary" hint="One or two sentences about the role.">
              <AdminTextarea
                rows={2}
                value={item.summary}
                onChange={(e) => update({ summary: e.target.value })}
              />
            </AdminField>

            <AdminField
              label="What you achieved"
              hint="One per line. Numbers land harder than adjectives."
            >
              <StringList
                value={item.achievements}
                onChange={(achievements) => update({ achievements })}
                rows={5}
              />
            </AdminField>

            <AdminField label="Tools used" hint="One per line.">
              <StringList value={item.stack} onChange={(stack) => update({ stack })} rows={4} />
            </AdminField>
          </div>
        )}
      />
    </AdminPanel>
  );
}
