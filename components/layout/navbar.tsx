"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/ui/magnetic";
import { useContent } from "@/components/providers/content-provider";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { cn } from "@/lib/utils";

/**
 * Floating navigation.
 *
 * Starts transparent over the hero and condenses into a glass pill once the
 * page scrolls — the chrome only appears when there's content behind it to
 * separate from. On sub-pages the anchors become links back to the home page's
 * sections, so the same array drives both.
 */
export function Navbar() {
  const { navigation, profile } = useContent();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { scrollTo } = useSmoothScroll();
  const { scrollY } = useScroll();

  const [condensed, setCondensed] = useState(false);

  /**
   * The mobile sheet stores *which route* it was opened on rather than a plain
   * boolean, so navigating away closes it by derivation. An effect that reset a
   * boolean on every pathname change would do the same thing with an extra
   * render and a stale frame in between.
   */
  const [openOnPath, setOpenOnPath] = useState<string | null>(null);
  const menuOpen = openOnPath === pathname;
  const setMenuOpen = useCallback(
    (open: boolean) => setOpenOnPath(open ? pathname : null),
    [pathname],
  );

  useMotionValueEvent(scrollY, "change", (value) => setCondensed(value > 40));

  const ids = useMemo(() => navigation.map((item) => item.id), [navigation]);
  const activeId = useScrollSpy(ids);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handleNavClick(event: React.MouseEvent, id: string) {
    if (!isHome) return; // Let the link navigate to /#id.
    event.preventDefault();
    setMenuOpen(false);
    scrollTo(id);
  }

  function openPalette() {
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-80 flex justify-center px-4 pt-4 sm:pt-5">
        <motion.nav
          animate={{
            width: condensed ? "min(58rem, 100%)" : "min(72rem, 100%)",
            paddingTop: condensed ? 8 : 12,
            paddingBottom: condensed ? 8 : 12,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "flex items-center gap-2 rounded-full px-3 sm:px-4",
            "transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500",
            condensed
              ? "glass shadow-soft-md"
              : "border border-transparent bg-transparent shadow-none",
          )}
        >
          {/* Wordmark */}
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-2.5 rounded-full py-1 pr-3 pl-1"
          >
            <span className="relative grid size-8 place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))]">
              <span className="font-display text-[0.8125rem] font-semibold text-white">
                {profile.shortName}
              </span>
              <span className="absolute inset-0 animate-spin-slow bg-[conic-gradient(from_0deg,transparent,rgb(255_255_255/0.35),transparent_40%)]" />
            </span>
            <span className="hidden font-display text-[0.9375rem] font-medium tracking-tight sm:block">
              {profile.wordmark}
              <span className="text-faint">.dev</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="mx-auto hidden items-center gap-0.5 lg:flex">
            {navigation.map((item) => {
              const isActive = isHome && activeId === item.id;
              return (
                <li key={item.id}>
                  <Link
                    href={isHome ? item.href : `/${item.href}`}
                    onClick={(event) => handleNavClick(event, item.id)}
                    className={cn(
                      "relative block rounded-full px-3.5 py-2 text-sm transition-colors duration-300",
                      isActive ? "text-content" : "text-muted hover:text-content",
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="nav-active"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-full bg-[var(--surface-raised)]"
                      />
                    ) : null}
                    <span className="relative">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            {/* Palette trigger doubles as the site's search affordance. */}
            <button
              type="button"
              onClick={openPalette}
              className="glass hidden h-10 items-center gap-2.5 rounded-full pr-2 pl-3.5 text-sm text-faint transition-colors duration-300 hover:text-content md:flex"
            >
              <Search className="size-3.5" />
              <span>Search</span>
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.625rem]">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            {/* maxDistance is capped below the condensed pill's 8px vertical
                clearance, so the pull can't drift the button past the pill
                edge once the navbar shrinks on scroll. */}
            <Magnetic className="hidden sm:inline-flex" strength={0.22} maxDistance={6}>
              <Button asChild variant="primary" size="sm" className="h-10 px-5">
                <Link
                  href={isHome ? "#contact" : "/#contact"}
                  onClick={(event) => handleNavClick(event, "contact")}
                >
                  Hire me
                </Link>
              </Button>
            </Magnetic>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="glass grid size-10 place-items-center rounded-full text-muted lg:hidden"
            >
              {menuOpen ? <X className="size-[1.05rem]" /> : <Menu className="size-[1.05rem]" />}
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            </button>
          </div>
        </motion.nav>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={handleNavClick}
        isHome={isHome}
        activeId={activeId}
      />
    </>
  );
}

function MobileNav({
  open,
  onClose,
  onNavigate,
  isHome,
  activeId,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (event: React.MouseEvent, id: string) => void;
  isHome: boolean;
  activeId: string;
}) {
  const { navigation, profile } = useContent();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-nav"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-70 bg-[var(--surface-base)]/95 backdrop-blur-2xl lg:hidden"
        >
          <div className="flex h-full flex-col justify-center px-8">
            <ul className="flex flex-col gap-1">
              {navigation.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05 + index * 0.045,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={isHome ? item.href : `/${item.href}`}
                    onClick={(event) => {
                      onNavigate(event, item.id);
                      onClose();
                    }}
                    className="flex items-baseline gap-4 py-3"
                  >
                    <span className="font-mono text-[0.625rem] text-faint tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "font-display text-3xl tracking-tight transition-colors duration-300",
                        isHome && activeId === item.id ? "text-primary" : "text-content",
                      )}
                    >
                      {item.label}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-12 flex flex-col gap-3"
            >
              <Button asChild variant="primary" size="lg">
                <Link
                  href={isHome ? "#contact" : "/#contact"}
                  onClick={(event) => {
                    onNavigate(event, "contact");
                    onClose();
                  }}
                >
                  Hire me
                </Link>
              </Button>
              <p className="text-center font-mono text-xs text-faint">{profile.email}</p>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
