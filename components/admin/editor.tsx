"use client";

import {
  Activity,
  AlertTriangle,
  Award,
  Check,
  ExternalLink,
  FolderGit2,
  Inbox,
  LayoutDashboard,
  Layers,
  Loader2,
  LogOut,
  MessageSquareQuote,
  Quote,
  RotateCcw,
  Save,
  Send,
  Settings,
  Shield,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AdminButton } from "@/components/admin/ui";
import { ActivityPanel } from "@/components/admin/panels/activity-panel";
import { AiPanel } from "@/components/admin/panels/ai-panel";
import { ContactPanel } from "@/components/admin/panels/contact-panel";
import { DashboardPanel } from "@/components/admin/panels/dashboard-panel";
import { EducationPanel } from "@/components/admin/panels/education-panel";
import { ExperiencePanel } from "@/components/admin/panels/experience-panel";
import { GithubPanel } from "@/components/admin/panels/github-panel";
import { InboxPanel } from "@/components/admin/panels/inbox-panel";
import { ProfilePanel } from "@/components/admin/panels/profile-panel";
import { ProjectsPanel } from "@/components/admin/panels/projects-panel";
import { SecurityPanel } from "@/components/admin/panels/security-panel";
import { ServicesPanel } from "@/components/admin/panels/services-panel";
import { SitePanel } from "@/components/admin/panels/site-panel";
import { SkillsPanel } from "@/components/admin/panels/skills-panel";
import { StackPanel } from "@/components/admin/panels/stack-panel";
import { TestimonialsPanel } from "@/components/admin/panels/testimonials-panel";
import { cn } from "@/lib/utils";
import type { PortfolioContent } from "@/types/content";

export type PanelProps = {
  content: PortfolioContent;
  patch: (partial: Partial<PortfolioContent>) => void;
};

/**
 * Content tabs edit the in-memory draft and share the Save bar. Tool tabs
 * (dashboard, inbox, activity) fetch their own data and don't touch the draft —
 * they're grouped separately in the sidebar so the two kinds don't blur.
 */
const CONTENT_TABS = [
  { id: "profile", label: "You", icon: User, Panel: ProfilePanel },
  { id: "contact", label: "Contact", icon: Send, Panel: ContactPanel },
  { id: "projects", label: "Projects", icon: Layers, Panel: ProjectsPanel },
  { id: "ai", label: "AI Lab", icon: Sparkles, Panel: AiPanel },
  { id: "skills", label: "Skills", icon: Wrench, Panel: SkillsPanel },
  { id: "experience", label: "Experience", icon: Briefcase, Panel: ExperiencePanel },
  { id: "education", label: "Education", icon: GraduationCap, Panel: EducationPanel },
  { id: "services", label: "Services", icon: Award, Panel: ServicesPanel },
  { id: "testimonials", label: "Testimonials", icon: Quote, Panel: TestimonialsPanel },
  { id: "stack", label: "Tech stack", icon: MessageSquareQuote, Panel: StackPanel },
  { id: "github", label: "GitHub", icon: FolderGit2, Panel: GithubPanel },
  { id: "site", label: "Site & SEO", icon: Settings, Panel: SitePanel },
  { id: "security", label: "Password", icon: Shield, Panel: SecurityPanel },
] as const;

const TOOL_TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inbox", label: "Messages", icon: Inbox },
  { id: "activity", label: "Activity", icon: Activity },
] as const;

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * The content editor.
 *
 * Everything is edited against an in-memory draft and written in one request,
 * so a half-finished edit never reaches the live site and there's exactly one
 * thing to undo: don't press Save.
 */
export function AdminEditor({
  initialContent,
  databaseConfigured,
}: {
  initialContent: PortfolioContent;
  databaseConfigured: boolean;
}) {
  const [saved, setSaved] = useState(initialContent);
  const [draft, setDraft] = useState(initialContent);
  const [tab, setTab] = useState<string>("dashboard");
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);

  // Unread badge on the Messages tab. Refreshed on mount and whenever the inbox
  // is opened (where the count changes as messages are read).
  useEffect(() => {
    if (tab !== "dashboard" && tab !== "inbox") return;
    let live = true;
    fetch("/api/admin/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => live && d && setUnread(d.unread ?? 0))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [tab]);

  // Structural comparison rather than a dirty flag: reverting an edit by hand
  // should genuinely clear the warning, not leave it stuck on.
  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const patch = useCallback((partial: Partial<PortfolioContent>) => {
    setDraft((current) => ({ ...current, ...partial }));
    setState("idle");
  }, []);

  const save = useCallback(async () => {
    setState("saving");
    setMessage(null);

    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) throw new Error(data.error ?? "Could not save.");

      setSaved(draft);
      setState("saved");
      window.setTimeout(() => setState((s) => (s === "saved" ? "idle" : s)), 2500);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not save.");
    }
  }, [draft]);

  // ⌘S / Ctrl+S saves, because that's what everyone will press anyway.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "s" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (isDirty) void save();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isDirty, save]);

  // Closing the tab mid-edit loses everything; the browser's own prompt is the
  // only reliable way to catch it.
  useEffect(() => {
    if (!isDirty) return;
    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  async function resetToDefaults() {
    if (
      !window.confirm(
        "Replace everything with the original example content? Your current text, photo and project links will be lost.",
      )
    ) {
      return;
    }

    setState("saving");
    try {
      const response = await fetch("/api/admin/content", { method: "DELETE" });
      const data = (await response.json()) as { content?: PortfolioContent; error?: string };
      if (!response.ok || !data.content) throw new Error(data.error ?? "Could not reset.");

      setDraft(data.content);
      setSaved(data.content);
      setState("saved");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Could not reset.");
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const ActivePanel = CONTENT_TABS.find((item) => item.id === tab)?.Panel ?? ProfilePanel;

  return (
    <div className="min-h-dvh">
      {/* ---------------------------------------------------------------- */}
      {/*  Top bar                                                          */}
      {/* ---------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-line bg-[var(--surface-base)]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))] font-display text-[0.8125rem] font-semibold text-white">
              {draft.profile.shortName}
            </span>
            <span className="text-sm font-medium">Portfolio admin</span>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {isDirty ? (
              <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wide text-[var(--brand-accent)] uppercase">
                <span className="size-1.5 rounded-full bg-current" />
                Unsaved
              </span>
            ) : state === "saved" ? (
              <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] tracking-wide text-[var(--brand-secondary)] uppercase">
                <Check className="size-3" />
                Saved
              </span>
            ) : null}

            <AdminButton onClick={() => window.open("/", "_blank")}>
              <ExternalLink className="size-4" />
              <span className="hidden sm:inline">View site</span>
            </AdminButton>

            <AdminButton onClick={signOut} title="Sign out">
              <LogOut className="size-4" />
              <span className="sr-only">Sign out</span>
            </AdminButton>

            <AdminButton
              tone="primary"
              onClick={save}
              disabled={!isDirty || state === "saving"}
            >
              {state === "saving" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {state === "saving" ? "Saving…" : "Save changes"}
            </AdminButton>
          </div>
        </div>

        {!databaseConfigured ? (
          <div className="border-t border-[color-mix(in_oklab,var(--brand-accent)_30%,transparent)] bg-[color-mix(in_oklab,var(--brand-accent)_10%,transparent)]">
            <p className="mx-auto flex max-w-6xl items-start gap-2.5 px-4 py-2.5 text-xs leading-relaxed text-muted sm:px-6">
              <AlertTriangle className="mt-px size-3.5 shrink-0 text-[var(--brand-accent)]" />
              <span>
                <strong className="text-content">No database connected.</strong> You can edit here,
                but <strong className="text-content">Save will fail</strong> until you add a{" "}
                <code className="font-mono">DATABASE_URL</code>. See README.md.
              </span>
            </p>
          </div>
        ) : null}

        {state === "error" && message ? (
          <div className="border-t border-[color-mix(in_oklab,#f87171_30%,transparent)] bg-[color-mix(in_oklab,#f87171_10%,transparent)]">
            <p
              role="alert"
              className="mx-auto max-w-6xl px-4 py-2.5 text-xs leading-relaxed text-[#f87171] sm:px-6"
            >
              {message}
            </p>
          </div>
        ) : null}
      </header>

      {/* ---------------------------------------------------------------- */}
      {/*  Body                                                             */}
      {/* ---------------------------------------------------------------- */}
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:gap-10 lg:py-10">
        <nav aria-label="Sections" className="lg:w-52 lg:shrink-0">
          <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">
            {TOOL_TABS.map((item) => (
              <SidebarLink
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                badge={item.id === "inbox" && unread > 0 ? unread : undefined}
                onClick={() => setTab(item.id)}
              />
            ))}

            {/* Divider between tools and content editing. */}
            <li aria-hidden className="my-2 hidden h-px bg-line lg:block" />
            <li aria-hidden className="mx-1 w-px shrink-0 self-stretch bg-line lg:hidden" />

            {CONTENT_TABS.map((item) => (
              <SidebarLink
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={tab === item.id}
                onClick={() => setTab(item.id)}
              />
            ))}
          </ul>

          <div className="mt-6 hidden lg:block">
            <AdminButton tone="danger" onClick={resetToDefaults} className="w-full">
              <RotateCcw className="size-4" />
              Reset to example
            </AdminButton>
          </div>
        </nav>

        <main className="min-w-0 flex-1">
          {tab === "dashboard" ? (
            <DashboardPanel onNavigate={setTab} />
          ) : tab === "inbox" ? (
            <InboxPanel />
          ) : tab === "activity" ? (
            <ActivityPanel />
          ) : (
            <ActivePanel content={draft} patch={patch} />
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarLink({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: typeof Inbox;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap",
          "transition-colors duration-200",
          active ? "bg-[var(--surface-raised)] text-content" : "text-muted hover:text-content",
        )}
      >
        <Icon className="size-4 shrink-0 opacity-70" />
        {label}
        {badge ? (
          <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-[var(--brand-primary)] px-1.5 text-[0.625rem] font-semibold text-white">
            {badge}
          </span>
        ) : null}
      </button>
    </li>
  );
}
