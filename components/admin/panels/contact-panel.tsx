"use client";

import { Repeatable } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";
import { iconRegistry } from "@/lib/icons";

const SOCIAL_ICONS = Object.keys(iconRegistry);

/** Email, location and the links people can reach you on. */
export function ContactPanel({ content, patch }: PanelProps) {
  const { profile, socials } = content;

  const setProfile = (partial: Partial<typeof profile>) =>
    patch({ profile: { ...profile, ...partial } });

  return (
    <div className="flex flex-col gap-5">
      <AdminPanel title="How to reach you" description="Shown in the hero, the contact section and the footer.">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Email" htmlFor="email" className="sm:col-span-2">
            <AdminInput
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ email: e.target.value })}
            />
          </AdminField>

          <AdminField label="Location" htmlFor="location" hint="e.g. Lahore, Pakistan">
            <AdminInput
              id="location"
              value={profile.location}
              onChange={(e) => setProfile({ location: e.target.value })}
            />
          </AdminField>

          <AdminField label="Time zone" htmlFor="timezone" hint="e.g. PKT (UTC+5)">
            <AdminInput
              id="timezone"
              value={profile.timezone}
              onChange={(e) => setProfile({ timezone: e.target.value })}
            />
          </AdminField>

          <AdminField
            label="Phone (optional)"
            htmlFor="phone"
            hint="Leave empty to hide it."
            className="sm:col-span-2"
          >
            <AdminInput
              id="phone"
              value={profile.phone ?? ""}
              onChange={(e) => setProfile({ phone: e.target.value || undefined })}
            />
          </AdminField>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Social links"
        description="These appear in the hero, the contact card, the footer and the ⌘K menu."
      >
        <Repeatable
          items={socials}
          onChange={(next) => patch({ socials: next })}
          createItem={() => ({ label: "New link", href: "https://", icon: "github", handle: "" })}
          addLabel="Add a link"
          summary={(item) => (
            <>
              {item.label} <span className="text-faint">{item.handle}</span>
            </>
          )}
          renderRow={(item, update) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Name" hint="e.g. GitHub">
                <AdminInput value={item.label} onChange={(e) => update({ label: e.target.value })} />
              </AdminField>

              <AdminField label="Icon">
                <select
                  value={item.icon}
                  onChange={(e) => update({ icon: e.target.value })}
                  className="w-full rounded-lg border border-line bg-[var(--surface-inset)]/60 px-3.5 py-2.5 text-[0.9375rem] text-content focus:outline-none"
                >
                  {SOCIAL_ICONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </AdminField>

              <AdminField
                label="Link"
                hint="Full address, including https:// — or mailto: for email."
                className="sm:col-span-2"
              >
                <AdminInput value={item.href} onChange={(e) => update({ href: e.target.value })} />
              </AdminField>

              <AdminField
                label="Handle"
                hint="Shown next to the name, e.g. @farhanasghar"
                className="sm:col-span-2"
              >
                <AdminInput
                  value={item.handle ?? ""}
                  onChange={(e) => update({ handle: e.target.value })}
                />
              </AdminField>
            </div>
          )}
        />
      </AdminPanel>
    </div>
  );
}
