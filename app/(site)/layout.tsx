import type { ReactNode } from "react";

import { CommandPalette } from "@/components/command/command-palette";
import { AmbientBackground } from "@/components/effects/ambient-background";
import { AnalyticsBeacon } from "@/components/effects/analytics-beacon";
import { Cursor } from "@/components/effects/cursor";
import { Preloader } from "@/components/effects/preloader";
import { BackToTop } from "@/components/layout/back-to-top";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ScrollProgressBar, ScrollSpine } from "@/components/layout/scroll-spine";
import { ContentProvider } from "@/components/providers/content-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { getContent } from "@/lib/content";
import { buildPersonSchema } from "@/lib/seo";

/**
 * Render on every request rather than at build time.
 *
 * Content lives in the database and is edited from the admin panel, so a
 * prerendered page would keep serving whatever was true when the site was last
 * deployed. With no database configured `getContent()` returns a constant, so
 * this costs nothing in that mode.
 */
export const dynamic = "force-dynamic";

/**
 * The public portfolio's shell.
 *
 * Fetches content once per render and provides it to every client component
 * below, so no section knows or cares whether it came from the database or the
 * file shipped in the repo.
 */
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const content = await getContent();

  return (
    <ContentProvider content={content}>
      <SmoothScrollProvider>
        {/* Keyboard users land here first. */}
        <a
          href="#main"
          className="sr-only rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200"
        >
          Skip to content
        </a>

        <Preloader />
        <AnalyticsBeacon />
        <AmbientBackground />
        <ScrollProgressBar />
        <Cursor />

        <Navbar />
        <ScrollSpine />

        <main id="main">{children}</main>

        <Footer />

        <BackToTop />
        <CommandPalette />

        <script
          type="application/ld+json"
          // Generated from the same content that renders the page — there is no
          // user-supplied content in this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPersonSchema(content)) }}
        />
      </SmoothScrollProvider>
    </ContentProvider>
  );
}
