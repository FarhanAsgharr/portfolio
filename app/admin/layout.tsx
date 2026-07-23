import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Admin",
  // The panel must never be indexed, whatever robots.txt happens to say.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Admin shell.
 *
 * No navbar, no cursor, no smooth scrolling, no particle field. This is a tool,
 * and every one of those would be in the way. It inherits fonts and theme from
 * the root layout so it still looks like part of the same product.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-[var(--surface-base)]">{children}</div>;
}
