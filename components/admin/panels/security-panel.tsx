"use client";

import { Check, Loader2 } from "lucide-react";
import { useState } from "react";

import { PasswordInput } from "@/components/admin/password-input";
import { AdminButton, AdminField, AdminPanel } from "@/components/admin/ui";
import type { PanelProps } from "@/components/admin/editor";

type Status = "idle" | "saving" | "done" | "error";

/**
 * Change the admin password.
 *
 * Standalone from the content draft: a password change takes effect the instant
 * it's saved, and shouldn't be bundled into the "Save changes" flow or lost if
 * the person navigates away with unsaved content. So it posts on its own.
 */
// Accepts PanelProps to match its siblings in the tab registry, but the
// password change is independent of the content draft, so none are read.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SecurityPanel(_: PanelProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const tooShort = next.length > 0 && next.length < 8;
  const mismatch = confirm.length > 0 && next !== confirm;
  const canSubmit =
    current.length > 0 && next.length >= 8 && next === confirm && status !== "saving";

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Could not change the password.");

      setStatus("done");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not change the password.");
    }
  }

  return (
    <AdminPanel
      title="Change password"
      description="This is the password you type to sign in here. It's stored in your database, so it takes effect everywhere immediately."
    >
      <form onSubmit={onSubmit} className="flex max-w-md flex-col gap-4">
        <AdminField label="Current password" htmlFor="current">
          <PasswordInput
            id="current"
            autoComplete="current-password"
            value={current}
            onChange={(e) => {
              setCurrent(e.target.value);
              setStatus("idle");
            }}
            placeholder="The password you use now"
          />
        </AdminField>

        <AdminField
          label="New password"
          htmlFor="new"
          hint={tooShort ? undefined : "At least 8 characters. Longer is better than complicated."}
        >
          <PasswordInput
            id="new"
            autoComplete="new-password"
            value={next}
            onChange={(e) => {
              setNext(e.target.value);
              setStatus("idle");
            }}
            placeholder="Your new password"
            aria-invalid={tooShort}
          />
          {tooShort ? (
            <p className="text-xs text-[#f87171]">Needs at least 8 characters.</p>
          ) : null}
        </AdminField>

        <AdminField label="Confirm new password" htmlFor="confirm">
          <PasswordInput
            id="confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              setStatus("idle");
            }}
            placeholder="Type it again"
            aria-invalid={mismatch}
          />
          {mismatch ? (
            <p className="text-xs text-[#f87171]">The two passwords don&apos;t match.</p>
          ) : null}
        </AdminField>

        {status === "error" && message ? (
          <p role="alert" className="text-sm text-[#f87171]">
            {message}
          </p>
        ) : null}

        {status === "done" ? (
          <p className="flex items-center gap-1.5 text-sm text-[var(--brand-secondary)]">
            <Check className="size-4" />
            Password changed. Use the new one next time you sign in.
          </p>
        ) : null}

        <AdminButton type="submit" tone="primary" disabled={!canSubmit} className="self-start">
          {status === "saving" ? <Loader2 className="size-4 animate-spin" /> : null}
          {status === "saving" ? "Changing…" : "Change password"}
        </AdminButton>
      </form>

      <p className="mt-6 max-w-md rounded-lg border border-line bg-[var(--surface-inset)]/40 px-4 py-3 text-xs leading-relaxed text-faint">
        Forgot it? Clear the one row in the <code className="font-mono">portfolio_auth</code> table
        in your database and the original <code className="font-mono">ADMIN_PASSWORD</code> works
        again. Full steps are in SETUP.md.
      </p>
    </AdminPanel>
  );
}
