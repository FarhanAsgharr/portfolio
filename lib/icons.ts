import {
  AudioLines,
  Brain,
  Cloud,
  Compass,
  Database,
  GitBranch,
  LayoutGrid,
  Layers,
  Library,
  Mail,
  MessageSquare,
  ScanEye,
  Server,
  Smartphone,
  Sparkles,
  Terminal,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

import { GitHubMark, LinkedInMark, XMark } from "@/components/icons/social";

/**
 * The shape every icon in the registry satisfies.
 *
 * Deliberately narrower than Lucide's own `LucideIcon`: the hand-drawn brand
 * marks are plain function components, not `forwardRef` exotics, and the site
 * only ever passes `className` and `size`. Typing the contract by what callers
 * actually use lets both kinds live in one registry.
 */
export type IconComponent = ComponentType<{ className?: string; size?: number | string }>;

/**
 * String → component registry.
 *
 * Content in `data/portfolio.ts` references icons by name so the data file
 * stays free of JSX and imports. `getIcon` falls back to a neutral glyph rather
 * than throwing, so a content typo degrades to a visible placeholder instead of
 * a crashed page.
 */
export const iconRegistry = {
  // Skill groups & services
  layout: LayoutGrid,
  server: Server,
  sparkles: Sparkles,
  brain: Brain,
  cloud: Cloud,
  database: Database,
  smartphone: Smartphone,
  "git-branch": GitBranch,
  wrench: Wrench,
  layers: Layers,
  compass: Compass,
  zap: Zap,

  // AI disciplines
  library: Library,
  workflow: Workflow,
  "message-square": MessageSquare,
  "scan-eye": ScanEye,
  "audio-lines": AudioLines,
  terminal: Terminal,

  // Social
  github: GitHubMark,
  linkedin: LinkedInMark,
  x: XMark,
  mail: Mail,
} satisfies Record<string, IconComponent>;

export type IconKey = keyof typeof iconRegistry;

export function getIcon(name: string): IconComponent {
  return (iconRegistry as Record<string, IconComponent>)[name] ?? Sparkles;
}
