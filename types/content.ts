import type {
  AIProject,
  Certificate,
  Education,
  Experience,
  GitHubStats,
  NavItem,
  Profile,
  Project,
  Service,
  SkillGroup,
  SocialLink,
  Stat,
  TechItem,
  Testimonial,
} from "@/types";

/**
 * Everything the admin panel can edit, in one object.
 *
 * The whole thing is stored as a single JSONB row rather than fourteen tables.
 * That's a deliberate trade: this is one person's content, read as a unit on
 * every page render and written as a unit by one editor. Normalising it would
 * add joins, migrations and referential bookkeeping to buy concurrency control
 * nobody here needs.
 */
export interface PortfolioContent {
  /** Bumped when the shape changes so `migrateContent` can upgrade old rows. */
  version: number;
  profile: Profile;
  socials: SocialLink[];
  navigation: NavItem[];
  spineSections: NavItem[];
  stats: Stat[];
  skillGroups: SkillGroup[];
  projects: Project[];
  aiProjects: AIProject[];
  experiences: Experience[];
  education: Education[];
  certificates: Certificate[];
  services: Service[];
  testimonials: Testimonial[];
  techStack: TechItem[];
  githubStats: GitHubStats;
  site: {
    /** Deployed origin. Drives canonical URLs, the sitemap and social cards. */
    url: string;
    keywords: string[];
  };
}

/** The current schema version. Increment when `PortfolioContent` changes shape. */
export const CONTENT_VERSION = 1;
