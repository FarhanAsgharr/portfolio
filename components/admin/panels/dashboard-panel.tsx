"use client";

import {
  Activity as ActivityIcon,
  ArrowUpRight,
  Eye,
  FolderGit2,
  Inbox,
  Loader2,
  MousePointerClick,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AdminPanel } from "@/components/admin/ui";
import type { ActivityEntry } from "@/lib/activity";
import type { AnalyticsSummary } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface DashboardData {
  analytics: AnalyticsSummary;
  unread: number;
  activity: ActivityEntry[];
  counts: { projects: number; skills: number; experience: number; testimonials: number };
}

const ACTIVITY_LABELS: Record<string, string> = {
  login: "Signed in",
  logout: "Signed out",
  login_failed: "Failed sign-in",
  content_saved: "Saved content",
  content_reset: "Reset to example",
  asset_uploaded: "Uploaded a file",
  password_changed: "Changed password",
  password_reset: "Reset password via SMS",
  message_received: "New message",
};

export function DashboardPanel({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (!live) return;
        if (d.error) setError(d.error);
        else setData(d as DashboardData);
      })
      .catch(() => live && setError("Couldn't load the dashboard."));
    return () => {
      live = false;
    };
  }, []);

  if (error) {
    return (
      <AdminPanel title="Dashboard">
        <p className="text-sm text-[#e0685e]">{error}</p>
      </AdminPanel>
    );
  }

  if (!data) {
    return (
      <div className="grid h-64 place-items-center text-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  const { analytics: a, unread, activity, counts } = data;

  return (
    <div className="flex flex-col gap-5">
      {/* Headline metric cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Eye} label="Total views" value={a.totalViews} accent="primary" />
        <StatCard icon={Users} label="Unique visitors" value={a.uniqueVisitors} accent="secondary" />
        <StatCard icon={MousePointerClick} label="Views (7 days)" value={a.views7d} accent="accent" />
        <StatCard
          icon={Inbox}
          label="Unread messages"
          value={unread}
          accent="primary"
          onClick={onNavigate ? () => onNavigate("inbox") : undefined}
        />
      </div>

      {/* Traffic trend + top pages */}
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <AdminPanel title="Visitors" description="Page views over the last 14 days.">
          <Sparkline data={a.daily} />
          <div className="mt-4 flex gap-6 text-sm">
            <span className="text-muted">
              Today <strong className="ml-1 text-content tabular-nums">{a.viewsToday}</strong>
            </span>
            <span className="text-muted">
              30 days <strong className="ml-1 text-content tabular-nums">{a.views30d}</strong>
            </span>
          </div>
        </AdminPanel>

        <AdminPanel title="Top pages">
          {a.topPages.length === 0 ? (
            <EmptyHint>No visits recorded yet.</EmptyHint>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {a.topPages.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-mono text-[0.8125rem] text-muted">{p.path}</span>
                  <span className="shrink-0 tabular-nums text-content">{p.views}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>

      {/* Devices + referrers + content counts */}
      <div className="grid gap-5 lg:grid-cols-3">
        <AdminPanel title="Devices">
          {a.devices.length === 0 ? (
            <EmptyHint>No data yet.</EmptyHint>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {a.devices.map((d) => (
                <li key={d.device} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-muted">{d.device}</span>
                  <span className="tabular-nums text-content">{d.views}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title="Referrers">
          {a.topReferrers.length === 0 ? (
            <EmptyHint>Direct traffic only so far.</EmptyHint>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {a.topReferrers.map((r) => (
                <li key={r.referrer} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-muted">{r.referrer}</span>
                  <span className="shrink-0 tabular-nums text-content">{r.views}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel title="Your content">
          <ul className="flex flex-col gap-2.5 text-sm">
            <CountRow icon={FolderGit2} label="Projects" value={counts.projects} />
            <CountRow label="Skills" value={counts.skills} />
            <CountRow label="Experience" value={counts.experience} />
            <CountRow label="Testimonials" value={counts.testimonials} />
          </ul>
        </AdminPanel>
      </div>

      {/* Recent activity */}
      <AdminPanel
        title="Recent activity"
        action={
          onNavigate ? (
            <button
              type="button"
              onClick={() => onNavigate("activity")}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              View all <ArrowUpRight className="size-3.5" />
            </button>
          ) : null
        }
      >
        {activity.length === 0 ? (
          <EmptyHint>Nothing yet — actions you take will appear here.</EmptyHint>
        ) : (
          <ul className="flex flex-col gap-1">
            {activity.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 border-b border-line py-2.5 text-sm last:border-0"
              >
                <span className="flex items-center gap-2.5">
                  <ActivityIcon className="size-3.5 shrink-0 text-faint" />
                  <span className="text-content">{ACTIVITY_LABELS[entry.action] ?? entry.action}</span>
                  {entry.detail ? <span className="text-faint">· {entry.detail}</span> : null}
                </span>
                <span className="shrink-0 font-mono text-[0.6875rem] text-faint">{relativeTime(entry.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  onClick,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
  accent: "primary" | "secondary" | "accent";
  onClick?: () => void;
}) {
  const color =
    accent === "primary"
      ? "var(--brand-primary)"
      : accent === "secondary"
        ? "var(--brand-secondary)"
        : "var(--brand-accent)";

  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "rounded-xl border border-line bg-[var(--surface-card)]/50 p-5 text-left",
        onClick && "transition-colors hover:border-line-strong",
      )}
    >
      <span
        className="grid size-9 place-items-center rounded-lg"
        style={{ backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`, color }}
      >
        <Icon className="size-[1.05rem]" />
      </span>
      <p className="mt-4 font-display text-3xl tracking-tight tabular-nums">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-faint">{label}</p>
    </Wrapper>
  );
}

/** A dependency-free sparkline: an area under a smoothed line. */
function Sparkline({ data }: { data: Array<{ date: string; views: number }> }) {
  const width = 600;
  const height = 90;
  const max = Math.max(1, ...data.map((d) => d.views));
  const step = data.length > 1 ? width / (data.length - 1) : width;

  const points = data.map((d, i) => ({
    x: i * step,
    y: height - (d.views / max) * (height - 8) - 4,
  }));

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--brand-primary)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--brand-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path
        d={line}
        fill="none"
        stroke="var(--brand-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function CountRow({ icon: Icon, label, value }: { icon?: typeof Eye; label: string; value: number }) {
  return (
    <li className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-muted">
        {Icon ? <Icon className="size-3.5 text-faint" /> : null}
        {label}
      </span>
      <span className="tabular-nums text-content">{value}</span>
    </li>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="py-4 text-sm text-faint">{children}</p>;
}

/** "3m ago" / "2h ago" / "5d ago" from an ISO timestamp. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
