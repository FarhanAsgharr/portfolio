"use client";

import { Repeatable } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel, AdminTextarea } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";

/** Client quotes for the carousel. */
export function TestimonialsPanel({ content, patch }: PanelProps) {
  return (
    <AdminPanel
      title="Testimonials"
      description="Shown one at a time in a carousel. A specific quote beats a flattering one."
    >
      <Repeatable
        items={content.testimonials}
        onChange={(testimonials) => patch({ testimonials })}
        addLabel="Add a testimonial"
        emptyLabel="No testimonials yet — the section hides itself until you add one."
        createItem={() => ({ quote: "", name: "", role: "", company: "" })}
        summary={(item) => (
          <>
            {item.name || "Unnamed"} <span className="text-faint">· {item.company}</span>
          </>
        )}
        renderRow={(item, update) => (
          <div className="flex flex-col gap-4">
            <AdminField label="Quote">
              <AdminTextarea
                rows={4}
                value={item.quote}
                onChange={(e) => update({ quote: e.target.value })}
              />
            </AdminField>

            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label="Name">
                <AdminInput value={item.name} onChange={(e) => update({ name: e.target.value })} />
              </AdminField>

              <AdminField label="Their role">
                <AdminInput value={item.role} onChange={(e) => update({ role: e.target.value })} />
              </AdminField>

              <AdminField label="Company">
                <AdminInput
                  value={item.company}
                  onChange={(e) => update({ company: e.target.value })}
                />
              </AdminField>
            </div>
          </div>
        )}
      />
    </AdminPanel>
  );
}
