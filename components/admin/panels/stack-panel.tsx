"use client";

import { Repeatable } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";

/** The scrolling technology rail. */
export function StackPanel({ content, patch }: PanelProps) {
  return (
    <AdminPanel
      title="Tech stack"
      description="The two scrolling rails. Each entry is a name and a colour for its dot."
    >
      <Repeatable
        items={content.techStack}
        onChange={(techStack) => patch({ techStack })}
        addLabel="Add a technology"
        createItem={() => ({ name: "New tool", icon: "sparkles", color: "#7C3AED" })}
        summary={(item) => (
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.name}
          </span>
        )}
        renderRow={(item, update) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Name">
              <AdminInput value={item.name} onChange={(e) => update({ name: e.target.value })} />
            </AdminField>

            <AdminField label="Dot colour" hint="The brand's own colour looks best.">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => update({ color: e.target.value })}
                  aria-label={`${item.name} colour`}
                  className="size-11 shrink-0 cursor-pointer rounded-lg border border-line bg-transparent"
                />
                <AdminInput
                  value={item.color}
                  onChange={(e) => update({ color: e.target.value })}
                  className="font-mono"
                />
              </div>
            </AdminField>
          </div>
        )}
      />
    </AdminPanel>
  );
}
