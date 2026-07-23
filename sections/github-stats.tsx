"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Flame, FolderGit2, Star, Users } from "lucide-react";

import { ContributionGraph } from "@/components/github/contribution-graph";
import { GitHubMark } from "@/components/icons/social";
import { Card } from "@/components/ui/card";
import { Counter } from "@/components/ui/counter";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";

const metrics = [
  { key: "repositories", label: "Repositories", icon: FolderGit2 },
  { key: "followers", label: "Followers", icon: Users },
  { key: "stars", label: "Stars earned", icon: Star },
  { key: "currentStreak", label: "Day streak", icon: Flame },
] as const;

/**
 * GitHub activity.
 *
 * The numbers live in `data/portfolio.ts` so the page has no runtime dependency
 * on the GitHub API — no rate limit, no loading state, no empty card if the API
 * is down. Point the values at a fetch in a server component when you want them
 * live; the layout doesn't change.
 */
export function GitHubSection() {
  const { githubStats } = useContent();
  return (
    <Section id="github">
      <SectionHeading
        node="github"
        title="Open source, in public"
        description="Most of what I learn ends up in a repository. A few of them turned out to be useful to other people."
        action={
          <a
            href={githubStats.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="glass group inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-sm text-muted transition-colors duration-300 hover:text-content"
          >
            <GitHubMark size={16} />
            <span className="font-mono">@{githubStats.username}</span>
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Heatmap */}
        <Reveal>
          <Card spotlight={false} className="h-full p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-mono text-eyebrow text-faint uppercase">Coding activity</h3>
              <p className="font-mono text-[0.6875rem] text-faint">
                longest streak {githubStats.longestStreak} days
              </p>
            </div>
            <div className="mt-6">
              <ContributionGraph total={githubStats.contributionsLastYear} />
            </div>
          </Card>
        </Reveal>

        {/* Languages */}
        <Reveal delay={0.08}>
          <Card spotlight={false} className="h-full p-6 sm:p-8">
            <h3 className="font-mono text-eyebrow text-faint uppercase">Languages</h3>

            {/* Single stacked bar — a set of parts of one whole, so it reads as
                one bar rather than six unrelated meters. */}
            <div className="mt-6 flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-inset)]">
              {githubStats.languages.map((language, index) => (
                <motion.span
                  key={language.name}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ backgroundColor: language.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${language.percentage}%` }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.15 + index * 0.07,
                  }}
                />
              ))}
            </div>

            <ul className="mt-7 flex flex-col gap-3.5">
              {githubStats.languages.map((language) => (
                <li key={language.name} className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: language.color }}
                  />
                  <span className="flex-1 text-sm text-muted">{language.name}</span>
                  <span className="font-mono text-[0.6875rem] text-faint tabular-nums">
                    {language.percentage}%
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      {/* Headline counts */}
      <RevealGroup
        as="ul"
        stagger={0.06}
        className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <RevealItem as="li" key={metric.key}>
              <Card className="h-full p-6">
                <Icon className="size-[1.15rem] text-primary" />
                <p className="mt-5 font-display text-3xl tracking-tight">
                  <Counter value={githubStats[metric.key]} />
                </p>
                <p className="mt-1 font-mono text-[0.625rem] tracking-wide text-faint uppercase">
                  {metric.label}
                </p>
              </Card>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
