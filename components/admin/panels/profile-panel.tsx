"use client";

import { FileUpload } from "@/components/admin/file-upload";
import { Repeatable, StringList } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel, AdminTextarea } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";

/** Identity, photo, résumé, story and the headline numbers. */
export function ProfilePanel({ content, patch }: PanelProps) {
  const { profile, stats } = content;

  const setProfile = (partial: Partial<typeof profile>) =>
    patch({ profile: { ...profile, ...partial } });

  return (
    <div className="flex flex-col gap-5">
      <AdminPanel title="Who you are" description="This drives the hero, the page title and your social share card.">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Full name" htmlFor="name">
            <AdminInput
              id="name"
              value={profile.name}
              onChange={(e) => setProfile({ name: e.target.value })}
            />
          </AdminField>

          <AdminField label="Job title" htmlFor="role" hint="Shown under your name and in search results.">
            <AdminInput
              id="role"
              value={profile.role}
              onChange={(e) => setProfile({ role: e.target.value })}
            />
          </AdminField>

          <AdminField label="Initials" htmlFor="shortName" hint="Two letters for the logo mark.">
            <AdminInput
              id="shortName"
              maxLength={3}
              value={profile.shortName}
              onChange={(e) => setProfile({ shortName: e.target.value })}
            />
          </AdminField>

          <AdminField
            label="Wordmark"
            htmlFor="wordmark"
            hint="The single word beside the logo, e.g. “farhan.dev”."
          >
            <AdminInput
              id="wordmark"
              value={profile.wordmark}
              onChange={(e) => setProfile({ wordmark: e.target.value })}
            />
          </AdminField>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          <AdminField
            label="Rotating titles"
            hint="One per line. These type themselves out in the hero, one after another."
          >
            <StringList
              value={profile.roles}
              onChange={(roles) => setProfile({ roles })}
              rows={4}
            />
          </AdminField>

          <AdminField label="Tagline" htmlFor="tagline" hint="One sentence. Appears under the About heading.">
            <AdminInput
              id="tagline"
              value={profile.tagline}
              onChange={(e) => setProfile({ tagline: e.target.value })}
            />
          </AdminField>

          <AdminField
            label="Short bio"
            htmlFor="bio"
            hint="Two or three sentences in the hero. Also used as your site description in Google."
          >
            <AdminTextarea
              id="bio"
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ bio: e.target.value })}
            />
          </AdminField>

          <AdminField
            label="Your story"
            hint="One paragraph per line. Blank lines are ignored. Shown in the About section."
          >
            <StringList
              value={profile.story}
              onChange={(story) => setProfile({ story })}
              rows={8}
            />
          </AdminField>
        </div>
      </AdminPanel>

      <AdminPanel title="Photo and résumé" description="Uploads are stored in your database and served from your own domain.">
        <div className="flex flex-col gap-6">
          <FileUpload
            assetId="avatar"
            label="Profile photo"
            accept="image/jpeg,image/png,image/webp,image/avif"
            currentUrl={profile.avatar}
            onUploaded={(avatar) => setProfile({ avatar })}
            hint="Portrait orientation works best. Large photos are shrunk automatically before upload."
            maxDimension={1200}
          />

          <FileUpload
            assetId="resume"
            label="Résumé (PDF)"
            accept="application/pdf"
            preview="file"
            currentUrl={profile.resumeUrl}
            onUploaded={(resumeUrl) => setProfile({ resumeUrl })}
            hint="This is what the Résumé button downloads."
          />
        </div>
      </AdminPanel>

      <AdminPanel title="Availability" description="The badge in the hero and the panel beside the contact form.">
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={profile.availability.open}
              onChange={(e) =>
                setProfile({ availability: { ...profile.availability, open: e.target.checked } })
              }
              className="size-4 accent-[var(--brand-primary)]"
            />
            <span className="text-sm text-content">
              I&apos;m open to work
              <span className="ml-2 text-faint">(adds the pulsing dot)</span>
            </span>
          </label>

          <AdminField label="Status" htmlFor="availLabel">
            <AdminInput
              id="availLabel"
              value={profile.availability.label}
              onChange={(e) =>
                setProfile({ availability: { ...profile.availability, label: e.target.value } })
              }
            />
          </AdminField>

          <AdminField label="Detail" htmlFor="availDetail">
            <AdminTextarea
              id="availDetail"
              rows={2}
              value={profile.availability.detail}
              onChange={(e) =>
                setProfile({ availability: { ...profile.availability, detail: e.target.value } })
              }
            />
          </AdminField>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Headline numbers"
        description="The four counters in the hero and About section."
      >
        <Repeatable
          items={stats}
          onChange={(next) => patch({ stats: next })}
          createItem={() => ({ label: "New number", value: 0, suffix: "", detail: "" })}
          addLabel="Add a number"
          summary={(item) => (
            <>
              {item.value}
              {item.suffix} · <span className="text-muted">{item.label}</span>
            </>
          )}
          renderRow={(item, update) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Label">
                <AdminInput value={item.label} onChange={(e) => update({ label: e.target.value })} />
              </AdminField>
              <div className="grid grid-cols-2 gap-3">
                <AdminField label="Number">
                  <AdminInput
                    type="number"
                    value={item.value}
                    onChange={(e) => update({ value: Number(e.target.value) || 0 })}
                  />
                </AdminField>
                <AdminField label="Suffix" hint="e.g. + or %">
                  <AdminInput
                    value={item.suffix ?? ""}
                    onChange={(e) => update({ suffix: e.target.value })}
                  />
                </AdminField>
              </div>
              <AdminField label="Detail" className="sm:col-span-2">
                <AdminInput
                  value={item.detail}
                  onChange={(e) => update({ detail: e.target.value })}
                />
              </AdminField>
            </div>
          )}
        />
      </AdminPanel>
    </div>
  );
}
