/**
 * Domain types for every piece of content rendered by the portfolio.
 *
 * `data/portfolio.ts` is the single source of truth and is typed against these
 * interfaces, so a typo in content becomes a compile error rather than a blank
 * region on the page.
 */

import type { LucideIcon } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Shared primitives                                                         */
/* -------------------------------------------------------------------------- */

/** Keys of the icon registry in `lib/icons.ts`. Keeps data serialisable. */
export type IconName = string;

export interface Link {
  label: string;
  href: string;
}

export interface SocialLink extends Link {
  /** Icon registry key, e.g. "github". */
  icon: IconName;
  /** Shown in the contact section's handle list. */
  handle?: string;
}

/* -------------------------------------------------------------------------- */
/*  Identity                                                                  */
/* -------------------------------------------------------------------------- */

export interface Profile {
  name: string;
  /** Initials for the logo mark. */
  shortName: string;
  /**
   * The single word used in the navbar/footer wordmark. Explicit rather than
   * derived, because splitting a full name on whitespace picks the wrong word
   * for most of the world's naming conventions.
   */
  wordmark: string;
  role: string;
  /** Rotated through the hero typing animation. */
  roles: string[];
  tagline: string;
  bio: string;
  /** Two to three paragraphs for the About section. */
  story: string[];
  location: string;
  timezone: string;
  email: string;
  phone?: string;
  avatar: string;
  resumeUrl: string;
  availability: {
    open: boolean;
    label: string;
    detail: string;
  };
}

/* -------------------------------------------------------------------------- */
/*  Stats & skills                                                            */
/* -------------------------------------------------------------------------- */

export interface Stat {
  label: string;
  value: number;
  /** Rendered after the animated number, e.g. "+" or "%". */
  suffix?: string;
  prefix?: string;
  detail: string;
}

export type SkillCategory =
  | "Frontend"
  | "Backend"
  | "AI"
  | "Machine Learning"
  | "Cloud"
  | "Database"
  | "Mobile"
  | "Tools"
  | "DevOps";

export interface Skill {
  name: string;
  /** 0–100. Drives the animated meter width. */
  level: number;
  /** Free text, e.g. "5 yrs". Shown on the card. */
  experience: string;
}

export interface SkillGroup {
  category: SkillCategory;
  icon: IconName;
  /** Accent used for the group's meters and glow. */
  accent: "primary" | "secondary" | "accent";
  summary: string;
  skills: Skill[];
}

/* -------------------------------------------------------------------------- */
/*  Projects                                                                  */
/* -------------------------------------------------------------------------- */

export type ProjectCategory =
  | "AI"
  | "Web"
  | "Full Stack"
  | "Automation"
  | "Mobile"
  | "Open Source";

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  slug: string;
  title: string;
  /** One line, shown on the card. */
  summary: string;
  /** Full write-up for the modal and detail page. */
  description: string;
  category: ProjectCategory;
  tags: string[];
  stack: string[];
  features: string[];
  metrics: ProjectMetric[];
  cover: string;
  year: number;
  featured: boolean;
  github?: string;
  demo?: string;
  /** Long-form sections rendered on /projects/[slug]. */
  caseStudy?: {
    problem: string;
    approach: string;
    outcome: string;
  };
}

/* -------------------------------------------------------------------------- */
/*  AI showcase                                                               */
/* -------------------------------------------------------------------------- */

export type AIDiscipline =
  | "RAG Systems"
  | "AI Agents"
  | "LLM Applications"
  | "Chatbots"
  | "Computer Vision"
  | "Automation"
  | "Voice AI"
  | "Prompt Engineering";

export interface AIProject {
  id: string;
  discipline: AIDiscipline;
  title: string;
  description: string;
  icon: IconName;
  stack: string[];
  /** Headline result, e.g. "94% answer accuracy". */
  impact: string;
  href?: string;
}

/* -------------------------------------------------------------------------- */
/*  Timelines                                                                 */
/* -------------------------------------------------------------------------- */

export interface Experience {
  company: string;
  role: string;
  type: "Full-time" | "Contract" | "Freelance" | "Internship";
  location: string;
  start: string;
  /** Omit for the current role. */
  end?: string;
  summary: string;
  achievements: string[];
  stack: string[];
}

export interface Education {
  institution: string;
  qualification: string;
  field: string;
  start: string;
  end: string;
  location: string;
  detail: string;
  highlights: string[];
}

export interface Certificate {
  name: string;
  issuer: string;
  year: string;
  credentialUrl?: string;
}

/* -------------------------------------------------------------------------- */
/*  Services, testimonials, tech                                              */
/* -------------------------------------------------------------------------- */

export interface Service {
  title: string;
  description: string;
  icon: IconName;
  deliverables: string[];
  /** e.g. "From $6k". Optional so pricing can stay private. */
  startingAt?: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Initials fallback when no photo is supplied. */
  avatar?: string;
}

export interface TechItem {
  name: string;
  /** Inline SVG path data or registry key. */
  icon: IconName;
  color: string;
}

/* -------------------------------------------------------------------------- */
/*  GitHub                                                                    */
/* -------------------------------------------------------------------------- */

export interface GitHubLanguage {
  name: string;
  percentage: number;
  color: string;
}

export interface GitHubStats {
  username: string;
  profileUrl: string;
  repositories: number;
  followers: number;
  following: number;
  stars: number;
  contributionsLastYear: number;
  longestStreak: number;
  currentStreak: number;
  languages: GitHubLanguage[];
}

/* -------------------------------------------------------------------------- */
/*  Blog                                                                      */
/* -------------------------------------------------------------------------- */

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date. */
  date: string;
  readingTime: number;
  tags: string[];
  /** Markdown-lite: array of paragraphs and headings. */
  body: Array<{ type: "h2" | "p" | "code" | "quote"; text: string }>;
}

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  /** Section id, used for the scroll spine and anchor. */
  id: string;
  label: string;
  href: string;
}

/* -------------------------------------------------------------------------- */
/*  Component helper types                                                    */
/* -------------------------------------------------------------------------- */

export interface CommandAction {
  id: string;
  label: string;
  group: "Navigate" | "Actions" | "Social" | "Appearance";
  icon: LucideIcon;
  shortcut?: string;
  perform: () => void;
  keywords?: string;
}
