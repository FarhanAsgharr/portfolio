import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { MotionProvider } from "@/components/providers/motion-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

import "./globals.css";

/* -------------------------------------------------------------------------- */
/*  Fonts                                                                     */
/*  Display carries the personality, body carries the reading, mono carries    */
/*  the engineering register — labels, metrics and node names.                 */
/* -------------------------------------------------------------------------- */

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  axes: ["opsz"],
});

const body = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500"],
});

/**
 * Root layout.
 *
 * Deliberately thin: the document shell, fonts and theme only. The portfolio's
 * chrome — navbar, footer, cursor, spine, smooth scrolling — lives in
 * `app/(site)/layout.tsx`, so the admin panel can render without inheriting any
 * of it while still sharing the fonts and theme.
 */

export async function generateMetadata(): Promise<Metadata> {
  const content = await getContent();

  return {
    metadataBase: new URL(content.site.url),
    ...buildMetadata(content),
    keywords: content.site.keywords,
    authors: [{ name: content.profile.name, url: content.site.url }],
    creator: content.profile.name,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    formatDetection: { email: false, address: false, telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050816" },
    { media: "(prefers-color-scheme: light)", color: "#fafafc" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // Tells Next the smooth scrolling in globals.css is deliberate, so it
      // doesn't warn about route transitions animating their scroll.
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider>
          <MotionProvider>{children}</MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
