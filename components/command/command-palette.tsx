"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Command as CommandIcon,
  CornerDownLeft,
  Download,
  Mail,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GitHubMark, LinkedInMark, XMark } from "@/components/icons/social";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { useContent } from "@/components/providers/content-provider";
import { cn } from "@/lib/utils";

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GitHubMark,
  linkedin: LinkedInMark,
  x: XMark,
  mail: Mail,
};

/**
 * ⌘K palette.
 *
 * Every destination on the site is reachable from here, which makes it real
 * navigation rather than a decoration. Built on Radix Dialog with `forceMount`
 * so the close animation gets to finish — cmdk's own `Command.Dialog` unmounts
 * immediately and would cut it off.
 */
export function CommandPalette() {
  const { navigation, profile, projects, socials } = useContent();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { scrollTo, setLocked } = useSmoothScroll();
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setLocked(open);
    return () => setLocked(false);
  }, [open, setLocked]);

  const runAndClose = useCallback(
    (action: () => void) => () => {
      setOpen(false);
      // Let the exit transition start before the page moves underneath it.
      window.setTimeout(action, 90);
    },
    [],
  );

  const groups = useMemo(() => {
    const navigate: PaletteItem[] = navigation.map((item) => ({
      id: `nav-${item.id}`,
      label: item.label,
      hint: item.href,
      icon: CommandIcon,
      run: runAndClose(() => scrollTo(item.id)),
    }));

    const work: PaletteItem[] = projects.map((project) => ({
      id: `project-${project.slug}`,
      label: project.title,
      hint: project.category,
      icon: ArrowUpRight,
      run: runAndClose(() => router.push(`/projects/${project.slug}`)),
    }));

    const actions: PaletteItem[] = [
      {
        id: "resume",
        label: "Download résumé",
        hint: "PDF",
        icon: Download,
        run: runAndClose(() => window.open(profile.resumeUrl, "_blank", "noopener,noreferrer")),
      },
      {
        id: "email",
        label: "Send an email",
        hint: profile.email,
        icon: Mail,
        run: runAndClose(() => window.location.assign(`mailto:${profile.email}`)),
      },
      {
        id: "blog",
        label: "Read the writing",
        hint: "/blog",
        icon: ArrowUpRight,
        run: runAndClose(() => router.push("/blog")),
      },
      {
        id: "theme",
        label: resolvedTheme === "dark" ? "Switch to light" : "Switch to dark",
        icon: resolvedTheme === "dark" ? Sun : Moon,
        run: runAndClose(() => setTheme(resolvedTheme === "dark" ? "light" : "dark")),
      },
    ];

    const social: PaletteItem[] = socials.map((item) => ({
      id: `social-${item.label}`,
      label: item.label,
      hint: item.handle,
      icon: socialIcons[item.icon] ?? ArrowUpRight,
      run: runAndClose(() => window.open(item.href, "_blank", "noopener,noreferrer")),
    }));

    return [
      { heading: "Go to", items: navigate },
      { heading: "Work", items: work },
      { heading: "Actions", items: actions },
      { heading: "Elsewhere", items: social },
    ];
  }, [runAndClose, scrollTo, router, resolvedTheme, setTheme, navigation, projects, socials, profile.email, profile.resumeUrl]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-150 bg-[#03050f]/80 backdrop-blur-md"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "fixed top-[12vh] left-1/2 z-150 w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2",
                  "overflow-hidden rounded-2xl border border-line",
                  "bg-[var(--surface-card)]/95 shadow-soft-lg backdrop-blur-2xl",
                )}
              >
                <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
                <DialogPrimitive.Description className="sr-only">
                  Search sections, projects and actions across the site.
                </DialogPrimitive.Description>

                <Command loop className="outline-none">
                  <div className="flex items-center gap-3 border-b border-line px-5">
                    <Search className="size-4 shrink-0 text-faint" />
                    <Command.Input
                      autoFocus
                      placeholder="Search sections, projects and actions…"
                      className="h-14 w-full bg-transparent text-[0.9375rem] text-content placeholder:text-faint focus:outline-none"
                    />
                    <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[0.625rem] text-faint sm:block">
                      ESC
                    </kbd>
                  </div>

                  <Command.List className="max-h-[min(24rem,60dvh)] overflow-y-auto overscroll-contain p-2">
                    <Command.Empty className="px-4 py-10 text-center text-sm text-faint">
                      Nothing matches that. Try a project name or “resume”.
                    </Command.Empty>

                    {groups.map((group) => (
                      <Command.Group
                        key={group.heading}
                        heading={group.heading}
                        className={cn(
                          "px-1 py-1.5",
                          "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-2",
                          "[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.625rem]",
                          "[&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-faint",
                          "[&_[cmdk-group-heading]]:uppercase",
                        )}
                      >
                        {group.items.map((item) => (
                          <Command.Item
                            key={item.id}
                            value={`${item.label} ${item.hint ?? ""}`}
                            onSelect={item.run}
                            className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted",
                              "transition-colors duration-150",
                              "data-[selected=true]:bg-[var(--surface-raised)] data-[selected=true]:text-content",
                            )}
                          >
                            <item.icon className="size-4 shrink-0 opacity-70" />
                            <span className="flex-1 truncate">{item.label}</span>
                            {item.hint ? (
                              <span className="hidden truncate font-mono text-xs text-faint sm:block">
                                {item.hint}
                              </span>
                            ) : null}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    ))}
                  </Command.List>

                  <div className="flex items-center gap-4 border-t border-line px-5 py-3 font-mono text-[0.625rem] tracking-wide text-faint">
                    <span className="flex items-center gap-1.5">
                      <CornerDownLeft className="size-3" /> select
                    </span>
                    <span>↑↓ navigate</span>
                    <span className="ml-auto hidden sm:block">⌘K to toggle</span>
                  </div>
                </Command>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
