"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { PortfolioContent } from "@/types/content";

const ContentContext = createContext<PortfolioContent | null>(null);

/**
 * Makes the site's content available to every client component.
 *
 * The value is fetched once per render on the server (in the root layout) and
 * passed down, so sections read live content without any of them knowing
 * whether it came from the database or the file shipped in the repo.
 */
export function ContentProvider({
  content,
  children,
}: {
  content: PortfolioContent;
  children: ReactNode;
}) {
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

export function useContent(): PortfolioContent {
  const content = useContext(ContentContext);
  if (!content) {
    throw new Error("useContent must be used inside <ContentProvider>");
  }
  return content;
}
