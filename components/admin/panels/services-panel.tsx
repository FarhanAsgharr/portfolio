"use client";

import { Repeatable, StringList } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel, AdminTextarea } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";
import { iconRegistry } from "@/lib/icons";

const ICONS = Object.keys(iconRegistry);

/** What clients can hire you for. */
export function ServicesPanel({ content, patch }: PanelProps) {
  return (
    <AdminPanel
      title="Services"
      description="What someone can hire you to do. Say what they get, not what you're good at."
    >
      <Repeatable
        items={content.services}
        onChange={(services) => patch({ services })}
        addLabel="Add a service"
        createItem={() => ({
          title: "New service",
          description: "",
          icon: "sparkles",
          deliverables: [],
          startingAt: "",
        })}
        summary={(item) => (
          <>
            {item.title}{" "}
            {item.startingAt ? <span className="text-faint">· {item.startingAt}</span> : null}
          </>
        )}
        renderRow={(item, update) => (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Service name">
                <AdminInput
                  value={item.title}
                  onChange={(e) => update({ title: e.target.value })}
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

            <AdminField label="Description">
              <AdminTextarea
                rows={3}
                value={item.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </AdminField>

            <AdminField label="What they get" hint="One per line. Be concrete.">
              <StringList
                value={item.deliverables}
                onChange={(deliverables) => update({ deliverables })}
              />
            </AdminField>

            <AdminField
              label="Price"
              hint='e.g. "From $6k" or "$300 / hr". Leave empty to hide it.'
            >
              <AdminInput
                value={item.startingAt ?? ""}
                onChange={(e) => update({ startingAt: e.target.value || undefined })}
              />
            </AdminField>
          </div>
        )}
      />
    </AdminPanel>
  );
}
