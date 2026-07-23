"use client";

import { Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminButton, AdminPanel } from "@/components/admin/ui";
import type { ContactMessage } from "@/lib/contact-store";
import { cn } from "@/lib/utils";

/** The contact-form inbox: read, mark read/unread, delete. */
export function InboxPanel() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setMessages(d.messages)))
      .catch(() => setError("Couldn't load messages."));
  }, []);

  async function markRead(id: number, read: boolean) {
    setMessages((prev) => prev?.map((m) => (m.id === id ? { ...m, is_read: read } : m)) ?? prev);
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    setMessages((prev) => prev?.filter((m) => m.id !== id) ?? prev);
    if (openId === id) setOpenId(null);
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
  }

  if (error) {
    return (
      <AdminPanel title="Messages">
        <p className="text-sm text-[#e0685e]">{error}</p>
      </AdminPanel>
    );
  }

  if (!messages) {
    return (
      <div className="grid h-64 place-items-center text-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <AdminPanel
      title="Messages"
      description={
        messages.length === 0
          ? "Submissions from your contact form will appear here."
          : `${messages.length} message${messages.length === 1 ? "" : "s"}, ${unreadCount} unread.`
      }
    >
      {messages.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line py-14 text-center text-sm text-faint">
          No messages yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {messages.map((m) => {
            const open = openId === m.id;
            return (
              <li
                key={m.id}
                className={cn(
                  "overflow-hidden rounded-lg border transition-colors",
                  open ? "border-line-strong bg-[var(--surface-inset)]/40" : "border-line",
                  !m.is_read && "border-l-2 border-l-[var(--brand-primary)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    const next = open ? null : m.id;
                    setOpenId(next);
                    if (!open && !m.is_read) void markRead(m.id, true);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left"
                >
                  <span className="shrink-0 text-faint">
                    {m.is_read ? <MailOpen className="size-4" /> : <Mail className="size-4 text-primary" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className={cn("truncate text-sm", m.is_read ? "text-muted" : "font-medium text-content")}>
                        {m.name}
                      </span>
                      <span className="truncate text-xs text-faint">{m.subject || "(no subject)"}</span>
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[0.625rem] text-faint">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-line px-4 py-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-faint">
                      <a
                        href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                        className="text-primary hover:underline"
                      >
                        {m.email}
                      </a>
                      <span>{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-content">{m.message}</p>
                    <div className="mt-4 flex gap-2">
                      <AdminButton onClick={() => markRead(m.id, !m.is_read)}>
                        {m.is_read ? "Mark unread" : "Mark read"}
                      </AdminButton>
                      <AdminButton tone="danger" onClick={() => remove(m.id)}>
                        <Trash2 className="size-4" />
                        Delete
                      </AdminButton>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </AdminPanel>
  );
}
