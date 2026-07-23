"use client";

import {
  FileText,
  KeyRound,
  LogIn,
  LogOut,
  Loader2,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminPanel } from "@/components/admin/ui";
import type { ActivityEntry } from "@/lib/activity";

const META: Record<string, { label: string; icon: typeof LogIn; tone: string }> = {
  login: { label: "Signed in", icon: LogIn, tone: "#54c79f" },
  logout: { label: "Signed out", icon: LogOut, tone: "#93a79e" },
  login_failed: { label: "Failed sign-in attempt", icon: ShieldAlert, tone: "#e0685e" },
  content_saved: { label: "Saved content", icon: FileText, tone: "var(--brand-secondary)" },
  content_reset: { label: "Reset to example content", icon: RotateCcw, tone: "#e0685e" },
  asset_uploaded: { label: "Uploaded a file", icon: Upload, tone: "var(--brand-primary)" },
  password_changed: { label: "Changed password", icon: KeyRound, tone: "var(--brand-accent)" },
  password_reset: { label: "Reset password via SMS", icon: KeyRound, tone: "var(--brand-accent)" },
  message_received: { label: "New contact message", icon: MessageSquare, tone: "var(--brand-primary)" },
};

/** The full audit trail. Read-only. */
export function ActivityPanel() {
  const [entries, setEntries] = useState<ActivityEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setEntries(d.activity)))
      .catch(() => setError("Couldn't load the activity log."));
  }, []);

  if (error) {
    return (
      <AdminPanel title="Activity log">
        <p className="text-sm text-[#e0685e]">{error}</p>
      </AdminPanel>
    );
  }

  if (!entries) {
    return (
      <div className="grid h-64 place-items-center text-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  return (
    <AdminPanel
      title="Activity log"
      description="A record of sign-ins, edits, uploads and password changes. Read-only."
    >
      {entries.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line py-14 text-center text-sm text-faint">
          No activity recorded yet.
        </p>
      ) : (
        <ul className="flex flex-col">
          {entries.map((e) => {
            const meta = META[e.action] ?? {
              label: e.action,
              icon: FileText,
              tone: "var(--content-faint)",
            };
            const Icon = meta.icon;
            return (
              <li key={e.id} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-lg"
                  style={{ backgroundColor: `color-mix(in oklab, ${meta.tone} 15%, transparent)`, color: meta.tone }}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-sm text-content">{meta.label}</span>
                  {e.detail ? <span className="ml-2 text-xs text-faint">{e.detail}</span> : null}
                </span>
                <span className="shrink-0 font-mono text-[0.6875rem] text-faint">
                  {new Date(e.created_at).toLocaleString()}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </AdminPanel>
  );
}
