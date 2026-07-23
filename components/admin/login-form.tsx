"use client";

import { ArrowLeft, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminButton, AdminField, AdminInput } from "@/components/admin/ui";

/**
 * Sign-in.
 *
 * When the panel isn't configured yet, this page explains what to do instead of
 * presenting a password box that cannot possibly work — a setup screen is more
 * useful than a locked door with no key.
 */
export function LoginForm({
  next,
  authConfigured,
  databaseConfigured,
}: {
  next?: string;
  authConfigured: boolean;
  databaseConfigured: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Could not sign in.");

      router.push(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-faint transition-colors hover:text-content"
        >
          <ArrowLeft className="size-4" />
          Back to the site
        </Link>

        <div className="rounded-2xl border border-line bg-[var(--surface-card)]/60 p-7 backdrop-blur-xl sm:p-9">
          <span className="grid size-11 place-items-center rounded-xl border border-line bg-[var(--surface-inset)] text-primary">
            <KeyRound className="size-5" />
          </span>

          <h1 className="mt-6 text-h3">Portfolio admin</h1>

          {authConfigured ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Sign in to edit your photo, résumé, projects and contact details.
              </p>

              <form onSubmit={onSubmit} className="mt-7 flex flex-col gap-4">
                <AdminField label="Password" htmlFor="password">
                  <AdminInput
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••••••"
                    aria-invalid={Boolean(error)}
                  />
                </AdminField>

                {error ? (
                  <p role="alert" className="text-sm text-[#f87171]">
                    {error}
                  </p>
                ) : null}

                <AdminButton type="submit" tone="primary" disabled={busy || !password}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                  {busy ? "Signing in…" : "Sign in"}
                </AdminButton>
              </form>

              {!databaseConfigured ? (
                <p className="mt-6 rounded-lg border border-[color-mix(in_oklab,var(--brand-accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--brand-accent)_10%,transparent)] px-4 py-3 text-xs leading-relaxed text-muted">
                  <strong className="text-content">No database connected.</strong> You can sign in
                  and look around, but saving will fail until you add{" "}
                  <code className="font-mono">DATABASE_URL</code>. See README.md.
                </p>
              ) : null}
            </>
          ) : (
            <SetupInstructions />
          )}
        </div>
      </div>
    </div>
  );
}

function SetupInstructions() {
  return (
    <div className="mt-2">
      <p className="text-sm text-muted">
        The admin panel isn&apos;t set up yet. Two settings turn it on.
      </p>

      <ol className="mt-6 flex flex-col gap-5">
        <li className="flex gap-3.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line font-mono text-[0.6875rem] text-faint">
            1
          </span>
          <div className="min-w-0">
            <p className="text-sm text-content">
              Create a file called <code className="font-mono text-primary">.env.local</code> in
              the project folder.
            </p>
          </div>
        </li>

        <li className="flex gap-3.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line font-mono text-[0.6875rem] text-faint">
            2
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-content">Put these two lines in it:</p>
            <pre className="mt-2.5 overflow-x-auto rounded-lg border border-line bg-[var(--surface-inset)] p-3.5 font-mono text-xs leading-relaxed text-muted">
              {`ADMIN_PASSWORD=pick-a-long-password
DATABASE_URL=postgres://…`}
            </pre>
            <p className="mt-2 text-xs leading-relaxed text-faint">
              README.md walks through getting a free database URL from Neon or Supabase.
            </p>
          </div>
        </li>

        <li className="flex gap-3.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line font-mono text-[0.6875rem] text-faint">
            3
          </span>
          <div className="min-w-0">
            <p className="text-sm text-content">
              Restart the server, then reload this page.
            </p>
            <p className="mt-1 text-xs text-faint">
              Environment files are only read at startup.
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
