"use client";

import { Repeatable, StringList } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";

/** Domain, search keywords and the two navigation lists. */
export function SitePanel({ content, patch }: PanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <AdminPanel
        title="Site address"
        description="Used for links Google and social networks follow. Get this wrong and your share previews break."
      >
        <div className="flex flex-col gap-4">
          <AdminField
            label="Your domain"
            htmlFor="siteUrl"
            hint="Include https:// and no trailing slash — e.g. https://farhanasghar.dev"
          >
            <AdminInput
              id="siteUrl"
              value={content.site.url}
              onChange={(e) => patch({ site: { ...content.site, url: e.target.value } })}
            />
          </AdminField>

          <AdminField
            label="Search keywords"
            hint="One per line. A modest, honest list works better than thirty guesses."
          >
            <StringList
              value={content.site.keywords}
              onChange={(keywords) => patch({ site: { ...content.site, keywords } })}
              rows={6}
            />
          </AdminField>
        </div>
      </AdminPanel>

      <AdminPanel
        title="Menu links"
        description="The links in the top bar. The address must match a section id on the page."
      >
        <Repeatable
          items={content.navigation}
          onChange={(navigation) => patch({ navigation })}
          addLabel="Add a link"
          createItem={() => ({ id: "about", label: "New", href: "#about" })}
          summary={(item) => (
            <>
              {item.label} <span className="text-faint">· {item.href}</span>
            </>
          )}
          renderRow={(item, update) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Text">
                <AdminInput
                  value={item.label}
                  onChange={(e) => update({ label: e.target.value })}
                />
              </AdminField>
              <AdminField label="Section id" hint="One of: about, skills, work, ai, experience, education, services, testimonials, stack, github, contact">
                <AdminInput
                  value={item.id}
                  onChange={(e) => update({ id: e.target.value, href: `#${e.target.value}` })}
                />
              </AdminField>
            </div>
          )}
        />
      </AdminPanel>

      <AdminPanel
        title="Side rail"
        description="The dots down the left edge on wide screens. Keep them in the order the sections appear."
      >
        <Repeatable
          items={content.spineSections}
          onChange={(spineSections) => patch({ spineSections })}
          addLabel="Add a dot"
          createItem={() => ({ id: "about", label: "New", href: "#about" })}
          summary={(item) => (
            <>
              {item.label} <span className="text-faint">· {item.id}</span>
            </>
          )}
          renderRow={(item, update) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Text">
                <AdminInput
                  value={item.label}
                  onChange={(e) => update({ label: e.target.value })}
                />
              </AdminField>
              <AdminField label="Section id">
                <AdminInput
                  value={item.id}
                  onChange={(e) => update({ id: e.target.value, href: `#${e.target.value}` })}
                />
              </AdminField>
            </div>
          )}
        />
      </AdminPanel>
    </div>
  );
}
