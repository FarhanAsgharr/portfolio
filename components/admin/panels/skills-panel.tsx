"use client";

import { Repeatable } from "@/components/admin/repeatable";
import { AdminButton, AdminField, AdminInput, AdminPanel } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";
import { iconRegistry } from "@/lib/icons";
import type { SkillGroup } from "@/types";

const ICONS = Object.keys(iconRegistry);
const ACCENTS: SkillGroup["accent"][] = ["primary", "secondary", "accent"];

/** Skill categories and the meters inside each one. */
export function SkillsPanel({ content, patch }: PanelProps) {
  return (
    <AdminPanel
      title="Skills"
      description="Each group is a card. The percentage sets how far its bar fills."
    >
      <Repeatable
        items={content.skillGroups}
        onChange={(skillGroups) => patch({ skillGroups })}
        addLabel="Add a category"
        createItem={() =>
          ({
            category: "Frontend",
            icon: "layout",
            accent: "primary",
            summary: "",
            skills: [{ name: "New skill", level: 80, experience: "1 yr" }],
          }) as SkillGroup
        }
        summary={(item) => (
          <>
            {item.category} <span className="text-faint">· {item.skills.length} skills</span>
          </>
        )}
        renderRow={(item, update) => (
          <div className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label="Category name">
                <AdminInput
                  value={item.category}
                  onChange={(e) =>
                    update({ category: e.target.value as SkillGroup["category"] })
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

              <AdminField label="Colour">
                <select
                  value={item.accent}
                  onChange={(e) => update({ accent: e.target.value as SkillGroup["accent"] })}
                  className="w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 px-3.5 py-2.5 text-[0.9375rem] text-content focus:outline-none"
                >
                  {ACCENTS.map((accent) => (
                    <option key={accent} value={accent}>
                      {accent === "primary"
                        ? "Violet"
                        : accent === "secondary"
                          ? "Cyan"
                          : "Amber"}
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <AdminField label="One-line summary">
              <AdminInput
                value={item.summary}
                onChange={(e) => update({ summary: e.target.value })}
              />
            </AdminField>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-content">Skills</span>

              {item.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="flex flex-wrap items-end gap-2">
                  <AdminInput
                    aria-label="Skill name"
                    placeholder="Skill"
                    value={skill.name}
                    onChange={(e) =>
                      update({
                        skills: item.skills.map((s, i) =>
                          i === skillIndex ? { ...s, name: e.target.value } : s,
                        ),
                      })
                    }
                    className="min-w-40 flex-1"
                  />
                  <AdminInput
                    aria-label="Years"
                    placeholder="3 yrs"
                    value={skill.experience}
                    onChange={(e) =>
                      update({
                        skills: item.skills.map((s, i) =>
                          i === skillIndex ? { ...s, experience: e.target.value } : s,
                        ),
                      })
                    }
                    className="w-24 shrink-0"
                  />
                  <label className="flex w-32 shrink-0 items-center gap-2">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={skill.level}
                      aria-label={`${skill.name} level`}
                      onChange={(e) =>
                        update({
                          skills: item.skills.map((s, i) =>
                            i === skillIndex ? { ...s, level: Number(e.target.value) } : s,
                          ),
                        })
                      }
                      className="w-full accent-[var(--brand-primary)]"
                    />
                    <span className="w-9 shrink-0 text-right font-mono text-xs text-faint tabular-nums">
                      {skill.level}
                    </span>
                  </label>
                  <AdminButton
                    tone="danger"
                    onClick={() =>
                      update({ skills: item.skills.filter((_, i) => i !== skillIndex) })
                    }
                    title="Remove skill"
                  >
                    ×
                  </AdminButton>
                </div>
              ))}

              <AdminButton
                className="self-start"
                onClick={() =>
                  update({
                    skills: [...item.skills, { name: "New skill", level: 75, experience: "1 yr" }],
                  })
                }
              >
                Add skill
              </AdminButton>
            </div>
          </div>
        )}
      />
    </AdminPanel>
  );
}
