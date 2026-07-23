"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { Marquee } from "@/components/ui/marquee";
import { useContent } from "@/components/providers/content-provider";

const year = new Date().getFullYear();

/**
 * Footer.
 *
 * Closes with the same invitation the contact section opens with, set at
 * display size — a last, quiet call to action rather than a wall of sitemap
 * links.
 */
export function Footer() {
  const { navigation, profile, socials } = useContent();
  return (
    <footer className="relative overflow-hidden border-t border-line">
      {/* An oversized wordmark rail, cropped by the viewport. */}
      <div
        aria-hidden
        className="pointer-events-none border-b border-line py-8 opacity-[0.07] select-none"
      >
        <Marquee durationSeconds={38} pauseOnHover={false}>
          <span className="px-8 font-display text-[clamp(3rem,10vw,8rem)] leading-none font-semibold tracking-tighter whitespace-nowrap">
            {profile.name} — {profile.role} —
          </span>
        </Marquee>
      </div>

      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          {/* Sign-off */}
          <div className="max-w-lg">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="relative grid size-9 place-items-center overflow-hidden rounded-lg bg-[linear-gradient(135deg,var(--brand-primary),var(--brand-secondary))]">
                <span className="font-display text-sm font-semibold text-white">
                  {profile.shortName}
                </span>
                <span className="absolute inset-0 animate-spin-slow bg-[conic-gradient(from_0deg,transparent,rgb(255_255_255/0.35),transparent_40%)]" />
              </span>
              <span className="font-display text-base font-medium tracking-tight">
                {profile.wordmark}
                <span className="text-faint">.dev</span>
              </span>
            </Link>

            <p className="mt-6 text-lead text-muted">
              Got something with a real constraint attached? That&apos;s the kind I like.
            </p>

            <a
              href={`mailto:${profile.email}`}
              className="group mt-6 inline-flex items-baseline gap-2 font-display text-h3 tracking-tight transition-colors duration-300 hover:text-primary"
            >
              {profile.email}
              <ArrowUpRight className="size-5 shrink-0 self-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <nav aria-label="Footer">
              <p className="font-mono text-eyebrow text-faint uppercase">Sections</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {navigation.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/${item.href}`}
                      className="text-sm text-muted transition-colors duration-300 hover:text-content"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/blog"
                    className="text-sm text-muted transition-colors duration-300 hover:text-content"
                  >
                    Writing
                  </Link>
                </li>
              </ul>
            </nav>

            <div>
              <p className="font-mono text-eyebrow text-faint uppercase">Elsewhere</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {socials.map((social) => (
                  <li key={social.label}>
                    <Link
                      href={social.href}
                      target={social.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2 text-sm text-muted transition-colors duration-300 hover:text-content"
                    >
                      <Icon name={social.icon} className="size-3.5 shrink-0" />
                      {social.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-faint">
            © {year} {profile.name}. Built with Next.js.
          </p>
          <p className="font-mono text-xs text-faint">
            Press{" "}
            <kbd className="rounded border border-line px-1.5 py-0.5 text-[0.6875rem]">⌘K</kbd> to
            navigate
          </p>
        </div>
      </div>
    </footer>
  );
}
