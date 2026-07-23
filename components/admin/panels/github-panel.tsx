"use client";

import { Repeatable } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";

/** The GitHub statistics section. */
export function GithubPanel({ content, patch }: PanelProps) {
  const { githubStats } = content;
  const set = (partial: Partial<typeof githubStats>) =>
    patch({ githubStats: { ...githubStats, ...partial } });

  const numbers = [
    { key: "repositories", label: "Repositories" },
    { key: "followers", label: "Followers" },
    { key: "following", label: "Following" },
    { key: "stars", label: "Stars earned" },
    { key: "contributionsLastYear", label: "Contributions this year" },
    { key: "currentStreak", label: "Current streak (days)" },
    { key: "longestStreak", label: "Longest streak (days)" },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <AdminPanel
        title="GitHub"
        description="Typed in rather than fetched live, so the section never shows a spinner or an empty card when GitHub is slow. Update it when you remember."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Username" hint="Shown as @username.">
            <AdminInput
              value={githubStats.username}
              onChange={(e) => set({ username: e.target.value })}
            />
          </AdminField>

          <AdminField label="Profile link">
            <AdminInput
              value={githubStats.profileUrl}
              onChange={(e) => set({ profileUrl: e.target.value })}
            />
          </AdminField>

          {numbers.map((field) => (
            <AdminField key={field.key} label={field.label}>
              <AdminInput
                type="number"
                value={githubStats[field.key]}
                onChange={(e) => set({ [field.key]: Number(e.target.value) || 0 })}
              />
            </AdminField>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel
        title="Languages"
        description="The stacked bar. Percentages should add up to 100."
      >
        <Repeatable
          items={githubStats.languages}
          onChange={(languages) => set({ languages })}
          addLabel="Add a language"
          createItem={() => ({ name: "New", percentage: 5, color: "#94A3B8" })}
          summary={(item) => (
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name} <span className="text-faint">· {item.percentage}%</span>
            </span>
          )}
          renderRow={(item, update) => (
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label="Name">
                <AdminInput value={item.name} onChange={(e) => update({ name: e.target.value })} />
              </AdminField>

              <AdminField label="Percentage">
                <AdminInput
                  type="number"
                  min={0}
                  max={100}
                  value={item.percentage}
                  onChange={(e) => update({ percentage: Number(e.target.value) || 0 })}
                />
              </AdminField>

              <AdminField label="Colour">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={item.color}
                    aria-label={`${item.name} colour`}
                    onChange={(e) => update({ color: e.target.value })}
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
    </div>
  );
}
