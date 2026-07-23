"use client";

import { Repeatable, StringList } from "@/components/admin/repeatable";
import { AdminField, AdminInput, AdminPanel, AdminTextarea } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";
import type { Certificate, Education } from "@/types";

/** Degrees, then the certificate list beside them. */
export function EducationPanel({ content, patch }: PanelProps) {
  return (
    <div className="flex flex-col gap-5">
      <AdminPanel title="Education" description="Degrees and formal study.">
        <Repeatable
          items={content.education}
          onChange={(education) => patch({ education })}
          addLabel="Add a qualification"
          createItem={(): Education => ({
            institution: "University",
            qualification: "BSc",
            field: "Computer Science",
            start: "2017",
            end: "2021",
            location: "",
            detail: "",
            highlights: [],
          })}
          summary={(item) => (
            <>
              {item.qualification} {item.field}{" "}
              <span className="text-faint">· {item.institution}</span>
            </>
          )}
          renderRow={(item, update) => (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Qualification" hint="e.g. BSc, MSc, Diploma">
                  <AdminInput
                    value={item.qualification}
                    onChange={(e) => update({ qualification: e.target.value })}
                  />
                </AdminField>

                <AdminField label="Subject">
                  <AdminInput
                    value={item.field}
                    onChange={(e) => update({ field: e.target.value })}
                  />
                </AdminField>

                <AdminField label="Institution" className="sm:col-span-2">
                  <AdminInput
                    value={item.institution}
                    onChange={(e) => update({ institution: e.target.value })}
                  />
                </AdminField>

                <AdminField label="Start year">
                  <AdminInput
                    value={item.start}
                    onChange={(e) => update({ start: e.target.value })}
                  />
                </AdminField>

                <AdminField label="End year">
                  <AdminInput value={item.end} onChange={(e) => update({ end: e.target.value })} />
                </AdminField>

                <AdminField label="Location" className="sm:col-span-2">
                  <AdminInput
                    value={item.location}
                    onChange={(e) => update({ location: e.target.value })}
                  />
                </AdminField>
              </div>

              <AdminField label="Description">
                <AdminTextarea
                  rows={3}
                  value={item.detail}
                  onChange={(e) => update({ detail: e.target.value })}
                />
              </AdminField>

              <AdminField label="Highlights" hint="One per line.">
                <StringList
                  value={item.highlights}
                  onChange={(highlights) => update({ highlights })}
                />
              </AdminField>
            </div>
          )}
        />
      </AdminPanel>

      <AdminPanel
        title="Certificates and courses"
        description="The list on the right of the Education section."
      >
        <Repeatable
          items={content.certificates}
          onChange={(certificates) => patch({ certificates })}
          addLabel="Add a certificate"
          createItem={(): Certificate => ({
            name: "New certificate",
            issuer: "",
            year: String(new Date().getFullYear()),
          })}
          summary={(item) => (
            <>
              {item.name} <span className="text-faint">· {item.year}</span>
            </>
          )}
          renderRow={(item, update) => (
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminField label="Name" className="sm:col-span-2">
                <AdminInput value={item.name} onChange={(e) => update({ name: e.target.value })} />
              </AdminField>

              <AdminField label="Issued by">
                <AdminInput
                  value={item.issuer}
                  onChange={(e) => update({ issuer: e.target.value })}
                />
              </AdminField>

              <AdminField label="Year">
                <AdminInput value={item.year} onChange={(e) => update({ year: e.target.value })} />
              </AdminField>

              <AdminField
                label="Verification link"
                hint="Optional. Makes the row clickable."
                className="sm:col-span-2"
              >
                <AdminInput
                  value={item.credentialUrl ?? ""}
                  onChange={(e) => update({ credentialUrl: e.target.value || undefined })}
                />
              </AdminField>
            </div>
          )}
        />
      </AdminPanel>
    </div>
  );
}
