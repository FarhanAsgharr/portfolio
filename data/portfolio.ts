/**
 * ============================================================================
 *  THE ONLY FILE YOU NEED TO EDIT
 * ============================================================================
 *
 *  Everything rendered on the site is derived from the exports below. Change a
 *  value here and it propagates to every section, the command palette, the
 *  sitemap, the structured data and the social cards.
 *
 *  Icon strings map to `lib/icons.ts`. If you use a name that isn't registered
 *  there, the build fails loudly instead of rendering a gap.
 * ============================================================================
 */

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

/* -------------------------------------------------------------------------- */
/*  1. Who you are                                                            */
/* -------------------------------------------------------------------------- */

export const profile: Profile = {
  name: "Muhammad Farhan Asghar",
  shortName: "MF",
  wordmark: "farhan",
  role: "AI & Full-Stack Engineer",
  roles: [
    "AI & Full-Stack Engineer",
    "RAG Systems Architect",
    "LLM Application Developer",
    "Next.js Specialist",
  ],
  tagline: "I build AI systems that survive contact with real users.",
  bio: "I design and ship production AI products — retrieval pipelines, autonomous agents and the interfaces around them. Six years in, my work is measured in latency budgets, eval scores and revenue, not demos.",
  story: [
    "I started where most engineers do: a single HTML file and a stubborn bug. What kept me here was the part nobody warns you about — that shipping software is mostly a question of judgement, not syntax. Which trade-off you take. What you leave out.",
    "For the last three years I've worked almost entirely on applied AI. Retrieval systems that answer from a company's own documents without inventing citations. Agents that call real tools and fail safely when the tool is down. The hard part is rarely the model; it's the eval harness, the fallback path and the latency budget around it.",
    "I care about the seam between infrastructure and interface. A retrieval pipeline with a 200ms p95 is worthless if the UI makes people wait for a spinner they don't understand. I build both sides, which means I get to design the whole system rather than argue across a boundary.",
  ],
  location: "Lahore, Pakistan",
  timezone: "PKT (UTC+5)",
  email: "hananideas@outlook.com",
  avatar: "/images/avatar.svg",
  resumeUrl: "/resume.pdf",
  availability: {
    open: true,
    label: "Available for select work",
    detail: "Taking on two engagements for Q3 — AI systems and full-stack product builds.",
  },
};

/* -------------------------------------------------------------------------- */
/*  2. Where to find you                                                      */
/* -------------------------------------------------------------------------- */

export const socials: SocialLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/farhanasghar",
    icon: "github",
    handle: "@farhanasghar",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/farhanasghar",
    icon: "linkedin",
    handle: "in/farhanasghar",
  },
  {
    label: "X",
    href: "https://x.com/farhanasghar",
    icon: "x",
    handle: "@farhanasghar",
  },
  {
    label: "Email",
    href: "mailto:hananideas@outlook.com",
    icon: "mail",
    handle: "hananideas@outlook.com",
  },
];

/* -------------------------------------------------------------------------- */
/*  3. Navigation — also drives the scroll spine and command palette          */
/* -------------------------------------------------------------------------- */

export const navigation: NavItem[] = [
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "work", label: "Work", href: "#work" },
  { id: "ai", label: "AI Lab", href: "#ai" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "services", label: "Services", href: "#services" },
  { id: "contact", label: "Contact", href: "#contact" },
];

/** Every section that gets a node on the left-hand spine, in document order. */
export const spineSections: NavItem[] = [
  { id: "hero", label: "Intro", href: "#hero" },
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "work", label: "Work", href: "#work" },
  { id: "ai", label: "AI Lab", href: "#ai" },
  { id: "experience", label: "Experience", href: "#experience" },
  { id: "education", label: "Education", href: "#education" },
  { id: "services", label: "Services", href: "#services" },
  { id: "testimonials", label: "Words", href: "#testimonials" },
  { id: "stack", label: "Stack", href: "#stack" },
  { id: "github", label: "GitHub", href: "#github" },
  { id: "contact", label: "Contact", href: "#contact" },
];

/* -------------------------------------------------------------------------- */
/*  4. Headline numbers                                                       */
/* -------------------------------------------------------------------------- */

export const stats: Stat[] = [
  {
    label: "Years building",
    value: 6,
    suffix: "+",
    detail: "Shipping since 2019, applied AI since 2022.",
  },
  {
    label: "Projects delivered",
    value: 48,
    suffix: "",
    detail: "From two-week prototypes to multi-year platforms.",
  },
  {
    label: "Production AI systems",
    value: 14,
    suffix: "",
    detail: "Retrieval, agents and vision pipelines serving real traffic.",
  },
  {
    label: "Technologies in anger",
    value: 60,
    suffix: "+",
    detail: "Counted only where I've debugged it at 2am, not read the docs.",
  },
];

/* -------------------------------------------------------------------------- */
/*  5. Skills                                                                 */
/* -------------------------------------------------------------------------- */

export const skillGroups: SkillGroup[] = [
  {
    category: "Frontend",
    icon: "layout",
    accent: "primary",
    summary: "Interfaces that stay fast under real data.",
    skills: [
      { name: "React & Next.js", level: 96, experience: "6 yrs" },
      { name: "TypeScript", level: 94, experience: "5 yrs" },
      { name: "Tailwind CSS", level: 95, experience: "4 yrs" },
      { name: "Framer Motion", level: 88, experience: "3 yrs" },
      { name: "Three.js / R3F", level: 78, experience: "2 yrs" },
    ],
  },
  {
    category: "Backend",
    icon: "server",
    accent: "secondary",
    summary: "APIs that hold their contract under load.",
    skills: [
      { name: "Node.js", level: 92, experience: "6 yrs" },
      { name: "Python / FastAPI", level: 90, experience: "4 yrs" },
      { name: "tRPC & GraphQL", level: 84, experience: "3 yrs" },
      { name: "Go", level: 70, experience: "2 yrs" },
      { name: "Event-driven design", level: 82, experience: "3 yrs" },
    ],
  },
  {
    category: "AI",
    icon: "sparkles",
    accent: "accent",
    summary: "Retrieval, agents and evaluation harnesses.",
    skills: [
      { name: "RAG architecture", level: 95, experience: "3 yrs" },
      { name: "LangChain / LlamaIndex", level: 90, experience: "3 yrs" },
      { name: "Agent orchestration", level: 89, experience: "2 yrs" },
      { name: "Prompt & context design", level: 93, experience: "3 yrs" },
      { name: "Eval pipelines", level: 86, experience: "2 yrs" },
    ],
  },
  {
    category: "Machine Learning",
    icon: "brain",
    accent: "primary",
    summary: "Training, fine-tuning and getting models off the notebook.",
    skills: [
      { name: "PyTorch", level: 84, experience: "3 yrs" },
      { name: "Transformers / PEFT", level: 82, experience: "2 yrs" },
      { name: "scikit-learn", level: 86, experience: "4 yrs" },
      { name: "Vector search & embeddings", level: 92, experience: "3 yrs" },
      { name: "MLflow", level: 76, experience: "2 yrs" },
    ],
  },
  {
    category: "Cloud",
    icon: "cloud",
    accent: "secondary",
    summary: "Deploys that are boring on purpose.",
    skills: [
      { name: "AWS (Lambda, ECS, S3)", level: 87, experience: "4 yrs" },
      { name: "Vercel", level: 94, experience: "5 yrs" },
      { name: "Cloudflare Workers", level: 80, experience: "2 yrs" },
      { name: "Google Cloud", level: 72, experience: "2 yrs" },
    ],
  },
  {
    category: "Database",
    icon: "database",
    accent: "accent",
    summary: "Schemas designed before the first query.",
    skills: [
      { name: "PostgreSQL", level: 91, experience: "5 yrs" },
      { name: "pgvector / Pinecone", level: 90, experience: "3 yrs" },
      { name: "Redis", level: 85, experience: "4 yrs" },
      { name: "MongoDB", level: 78, experience: "3 yrs" },
      { name: "Prisma & Drizzle", level: 89, experience: "3 yrs" },
    ],
  },
  {
    category: "Mobile",
    icon: "smartphone",
    accent: "primary",
    summary: "One codebase, native where it counts.",
    skills: [
      { name: "React Native", level: 82, experience: "3 yrs" },
      { name: "Expo", level: 85, experience: "3 yrs" },
      { name: "Offline-first sync", level: 74, experience: "2 yrs" },
    ],
  },
  {
    category: "DevOps",
    icon: "git-branch",
    accent: "secondary",
    summary: "Pipelines that catch what review misses.",
    skills: [
      { name: "Docker", level: 88, experience: "4 yrs" },
      { name: "GitHub Actions", level: 90, experience: "4 yrs" },
      { name: "Terraform", level: 72, experience: "2 yrs" },
      { name: "Observability (OTel, Sentry)", level: 83, experience: "3 yrs" },
    ],
  },
  {
    category: "Tools",
    icon: "wrench",
    accent: "accent",
    summary: "The daily drivers.",
    skills: [
      { name: "Git", level: 95, experience: "6 yrs" },
      { name: "Figma", level: 80, experience: "4 yrs" },
      { name: "Playwright & Vitest", level: 86, experience: "3 yrs" },
      { name: "Linear & Notion", level: 88, experience: "4 yrs" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/*  6. Featured work                                                          */
/* -------------------------------------------------------------------------- */

export const projects: Project[] = [
  {
    slug: "atlas-knowledge-engine",
    title: "Atlas Knowledge Engine",
    summary:
      "Retrieval platform that answers policy questions from 400k internal documents with verifiable citations.",
    description:
      "Atlas replaced a support team's manual document lookup with a hybrid retrieval pipeline. Every answer carries a citation that resolves to a page and paragraph, and the eval harness blocks any deploy that regresses grounded accuracy below 92%.",
    category: "AI",
    tags: ["RAG", "Retrieval", "Evaluation"],
    stack: ["Next.js", "FastAPI", "pgvector", "PostgreSQL", "Redis", "AWS"],
    features: [
      "Hybrid BM25 + dense retrieval with a cross-encoder reranker",
      "Citation resolver that links every claim to a source paragraph",
      "Offline eval suite of 1,200 graded question–answer pairs",
      "Streaming answers with a 340ms time-to-first-token",
      "Per-tenant document isolation enforced at the query layer",
    ],
    metrics: [
      { label: "Grounded accuracy", value: "94%" },
      { label: "p95 latency", value: "820ms" },
      { label: "Documents indexed", value: "412k" },
    ],
    cover: "/images/projects/atlas.svg",
    year: 2025,
    featured: true,
    github: "https://github.com/farhanasghar/atlas-knowledge-engine",
    demo: "https://atlas.example.com",
    caseStudy: {
      problem:
        "Support agents spent an average of 11 minutes per ticket searching a document store that had outgrown its search index. Answers varied by agent, and there was no way to trace where an answer came from.",
      approach:
        "I built a hybrid retrieval pipeline — lexical search for exact policy identifiers, dense retrieval for paraphrased questions, then a cross-encoder to rerank the merged candidate set. The generation step is constrained to quote-and-cite, so an answer without a resolvable source is rejected before it reaches the user.",
      outcome:
        "Median handling time dropped to under 3 minutes. The eval harness now runs on every pull request, which turned prompt changes from a leap of faith into a measurable diff.",
    },
  },
  {
    slug: "meridian-agent-runtime",
    title: "Meridian Agent Runtime",
    summary:
      "Tool-calling agent runtime with deterministic replay, budget caps and safe failure paths.",
    description:
      "Meridian runs multi-step agents against real internal tools. Every run is recorded as an append-only trace that can be replayed step by step, which makes debugging an agent feel like debugging ordinary code.",
    category: "AI",
    tags: ["Agents", "Tooling", "Observability"],
    stack: ["TypeScript", "Node.js", "PostgreSQL", "Temporal", "OpenTelemetry"],
    features: [
      "Deterministic replay of any historical agent run",
      "Per-run token and cost ceilings with graceful degradation",
      "Typed tool registry with runtime schema validation",
      "Automatic retry with exponential backoff on tool failure",
      "Trace viewer that diffs two runs side by side",
    ],
    metrics: [
      { label: "Task success", value: "87%" },
      { label: "Cost per run", value: "-62%" },
      { label: "Mean steps", value: "4.3" },
    ],
    cover: "/images/projects/meridian.svg",
    year: 2025,
    featured: true,
    github: "https://github.com/farhanasghar/meridian-agent-runtime",
    demo: "https://meridian.example.com",
    caseStudy: {
      problem:
        "The team's first agent worked in demos and failed unpredictably in production. Nobody could reproduce a failure, because each run took a different path and the logs recorded only the final answer.",
      approach:
        "I made the run the unit of work: every model call, tool invocation and retry is appended to an immutable trace with its inputs. A replay executor re-runs a trace against recorded responses, so a failure from last Tuesday can be stepped through today.",
      outcome:
        "Debugging time collapsed from days to minutes, and the cost ceiling caught three runaway loops in the first month that would otherwise have been discovered on the invoice.",
    },
  },
  {
    slug: "cadence-analytics",
    title: "Cadence Analytics",
    summary:
      "Real-time product analytics dashboard rendering 50M events without a loading spinner.",
    description:
      "Cadence is a self-hosted analytics surface built for teams who want their event data to stay in their own warehouse. Queries are pre-aggregated on write, so the dashboard reads from materialised rollups instead of scanning raw events.",
    category: "Full Stack",
    tags: ["Analytics", "Realtime", "Data"],
    stack: ["Next.js", "TypeScript", "ClickHouse", "Kafka", "Tailwind CSS"],
    features: [
      "Incremental rollups computed on ingest",
      "Cohort and funnel builder with a visual query editor",
      "Live event stream over server-sent events",
      "CSV and warehouse export with scheduled delivery",
      "Role-based access down to the individual metric",
    ],
    metrics: [
      { label: "Events / day", value: "50M" },
      { label: "Dashboard load", value: "310ms" },
      { label: "Storage saved", value: "71%" },
    ],
    cover: "/images/projects/cadence.svg",
    year: 2024,
    featured: true,
    github: "https://github.com/farhanasghar/cadence-analytics",
    demo: "https://cadence.example.com",
    caseStudy: {
      problem:
        "The existing dashboard scanned raw event tables on every page view. At 12M events it took nine seconds to load; at 50M it timed out.",
      approach:
        "I moved aggregation to write time. Each event updates a set of materialised rollups keyed by the dimensions the product actually filters on, and the dashboard reads only those. Raw events remain queryable for ad-hoc work, just not on the hot path.",
      outcome:
        "Load time went from nine seconds to a third of a second, and storage costs fell by 71% once raw events could be tiered to cold storage after 30 days.",
    },
  },
  {
    slug: "harbor-invoice-automation",
    title: "Harbor",
    summary:
      "Document automation that reads invoices, reconciles them against purchase orders and flags what a human should see.",
    description:
      "Harbor combines layout-aware extraction with deterministic reconciliation rules. Anything that matches cleanly posts automatically; anything ambiguous goes to a review queue with the specific field in dispute highlighted.",
    category: "Automation",
    tags: ["Document AI", "Vision", "Workflow"],
    stack: ["Python", "FastAPI", "LayoutLM", "PostgreSQL", "Celery"],
    features: [
      "Layout-aware field extraction across 40+ invoice templates",
      "Three-way match against purchase orders and receipts",
      "Confidence-gated auto-posting with a human review queue",
      "Full audit trail per document for finance compliance",
    ],
    metrics: [
      { label: "Auto-posted", value: "78%" },
      { label: "Field accuracy", value: "97.4%" },
      { label: "Hours saved / wk", value: "31" },
    ],
    cover: "/images/projects/harbor.svg",
    year: 2024,
    featured: true,
    github: "https://github.com/farhanasghar/harbor",
    caseStudy: {
      problem:
        "A finance team of four keyed roughly 900 invoices a month by hand and caught mismatches only at month end, when fixing them was expensive.",
      approach:
        "Extraction is layout-aware rather than template-matched, so a new supplier format degrades gracefully instead of failing. Reconciliation is deliberately deterministic — no model decides whether an invoice posts, only how confident the extraction was.",
      outcome:
        "78% of invoices now post without a human touch, and mismatches surface on the day they arrive rather than three weeks later.",
    },
  },
  {
    slug: "signal-voice-console",
    title: "Signal Voice Console",
    summary:
      "Low-latency voice interface for field technicians working with their hands full.",
    description:
      "Signal is a hands-free console that lets technicians query equipment history and log work by voice. The whole loop — speech in, answer out — stays under 900ms by streaming every stage rather than waiting for the previous one to finish.",
    category: "AI",
    tags: ["Voice AI", "Streaming", "Realtime"],
    stack: ["React Native", "WebRTC", "Whisper", "Node.js", "Redis"],
    features: [
      "Streaming transcription with partial-result correction",
      "Barge-in support so users can interrupt the response",
      "Offline command cache for low-connectivity sites",
      "Noise-robust wake word tuned on real site recordings",
    ],
    metrics: [
      { label: "Round-trip", value: "880ms" },
      { label: "Word error rate", value: "6.1%" },
      { label: "Daily users", value: "1.2k" },
    ],
    cover: "/images/projects/signal.svg",
    year: 2023,
    featured: false,
    demo: "https://signal.example.com",
  },
  {
    slug: "prism-design-system",
    title: "Prism Design System",
    summary:
      "Open-source React component library with 62 accessible primitives and zero runtime CSS.",
    description:
      "Prism is the design system I extracted from four consecutive client projects. Every component ships with keyboard interaction, focus management and a documented contract, and the whole library compiles to static CSS.",
    category: "Open Source",
    tags: ["Design System", "Accessibility", "OSS"],
    stack: ["React", "TypeScript", "Tailwind CSS", "Radix UI", "Storybook"],
    features: [
      "62 primitives audited against WCAG 2.2 AA",
      "Zero runtime CSS-in-JS — everything compiles ahead of time",
      "Theme tokens as plain CSS custom properties",
      "Visual regression tests on every pull request",
    ],
    metrics: [
      { label: "GitHub stars", value: "2.4k" },
      { label: "Weekly installs", value: "18k" },
      { label: "Bundle (gzip)", value: "14kB" },
    ],
    cover: "/images/projects/prism.svg",
    year: 2023,
    featured: false,
    github: "https://github.com/farhanasghar/prism",
  },
  {
    slug: "orbit-field-app",
    title: "Orbit Field App",
    summary:
      "Offline-first mobile app for inspection crews working past the edge of coverage.",
    description:
      "Orbit assumes the network is gone. Inspections are captured locally, conflict resolution is explicit rather than last-write-wins, and sync resumes from wherever it was interrupted.",
    category: "Mobile",
    tags: ["Offline-first", "Sync", "Mobile"],
    stack: ["React Native", "Expo", "SQLite", "TypeScript"],
    features: [
      "Conflict-aware sync with a human-readable merge view",
      "Photo capture with deferred, resumable upload",
      "Background sync that survives app termination",
      "Signature capture and on-device PDF report generation",
    ],
    metrics: [
      { label: "Offline sessions", value: "64%" },
      { label: "Sync conflicts", value: "0.3%" },
      { label: "Crash-free", value: "99.7%" },
    ],
    cover: "/images/projects/orbit.svg",
    year: 2022,
    featured: false,
  },
];

/* -------------------------------------------------------------------------- */
/*  7. AI lab                                                                 */
/* -------------------------------------------------------------------------- */

export const aiProjects: AIProject[] = [
  {
    id: "rag",
    discipline: "RAG Systems",
    title: "Grounded retrieval pipelines",
    description:
      "Hybrid lexical and dense retrieval with reranking, chunk strategies tuned per corpus, and citations that resolve to a source paragraph.",
    icon: "library",
    stack: ["pgvector", "Pinecone", "LlamaIndex", "Cohere Rerank"],
    impact: "94% grounded accuracy on a 1,200-question eval set",
    href: "/projects/atlas-knowledge-engine",
  },
  {
    id: "agents",
    discipline: "AI Agents",
    title: "Tool-calling agents that fail safely",
    description:
      "Typed tool registries, per-run budget ceilings and deterministic replay, so an agent failure can be reproduced instead of guessed at.",
    icon: "workflow",
    stack: ["Claude", "Temporal", "TypeScript", "OpenTelemetry"],
    impact: "87% task success at 62% lower cost per run",
    href: "/projects/meridian-agent-runtime",
  },
  {
    id: "llm-apps",
    discipline: "LLM Applications",
    title: "Products with a model inside",
    description:
      "Streaming interfaces, structured output contracts and graceful degradation when the model is slow, rate-limited or simply wrong.",
    icon: "sparkles",
    stack: ["Next.js", "Vercel AI SDK", "Zod", "Redis"],
    impact: "Sub-400ms time-to-first-token across three products",
  },
  {
    id: "chatbots",
    discipline: "Chatbots",
    title: "Support assistants that escalate well",
    description:
      "Conversational systems that know their limits — confidence thresholds, handoff to a human with full context, and no invented policy.",
    icon: "message-square",
    stack: ["LangGraph", "PostgreSQL", "Twilio", "Slack API"],
    impact: "41% deflection with a 4.6/5 satisfaction score",
  },
  {
    id: "vision",
    discipline: "Computer Vision",
    title: "Document and scene understanding",
    description:
      "Layout-aware extraction, defect detection and OCR pipelines built to degrade gracefully on formats they have never seen.",
    icon: "scan-eye",
    stack: ["PyTorch", "LayoutLM", "OpenCV", "ONNX Runtime"],
    impact: "97.4% field accuracy across 40+ document layouts",
    href: "/projects/harbor-invoice-automation",
  },
  {
    id: "automation",
    discipline: "Automation",
    title: "Workflows that remove the manual step",
    description:
      "Event-driven pipelines where the model handles the ambiguous part and deterministic code handles everything that must be exactly right.",
    icon: "zap",
    stack: ["Python", "Celery", "n8n", "AWS Lambda"],
    impact: "31 hours a week returned to a four-person team",
  },
  {
    id: "voice",
    discipline: "Voice AI",
    title: "Real-time speech interfaces",
    description:
      "Streaming transcription with barge-in, tuned wake words and an offline command cache for sites with no reliable connection.",
    icon: "audio-lines",
    stack: ["Whisper", "WebRTC", "Deepgram", "React Native"],
    impact: "880ms round-trip at a 6.1% word error rate",
    href: "/projects/signal-voice-console",
  },
  {
    id: "prompting",
    discipline: "Prompt Engineering",
    title: "Context design as an engineering discipline",
    description:
      "Versioned prompts, graded eval sets and regression gates in CI. A prompt change ships with a measured diff, not an opinion.",
    icon: "terminal",
    stack: ["Promptfoo", "Braintrust", "GitHub Actions"],
    impact: "Prompt regressions caught before merge, not in production",
  },
];

/* -------------------------------------------------------------------------- */
/*  8. Experience                                                             */
/* -------------------------------------------------------------------------- */

export const experiences: Experience[] = [
  {
    company: "Northwind Labs",
    role: "Senior AI Engineer",
    type: "Full-time",
    location: "Remote",
    start: "2023",
    summary:
      "Lead engineer on the retrieval and agent platform used by every product team in the company.",
    achievements: [
      "Designed the retrieval architecture behind Atlas, cutting support handling time from 11 minutes to under 3",
      "Built the eval harness that gates every prompt and model change in CI, ending a year of untracked regressions",
      "Introduced per-run cost ceilings that reduced inference spend 62% without a measurable quality drop",
      "Mentored four engineers into owning their own AI surfaces end to end",
    ],
    stack: ["TypeScript", "Python", "PostgreSQL", "pgvector", "AWS", "Temporal"],
  },
  {
    company: "Sable Interactive",
    role: "Full-Stack Engineer",
    type: "Full-time",
    location: "Lahore, PK",
    start: "2021",
    end: "2023",
    summary:
      "Built data-heavy product surfaces for B2B clients, then stayed on to fix what scaled badly.",
    achievements: [
      "Rebuilt the Cadence analytics pipeline around write-time rollups, taking dashboard load from 9s to 310ms",
      "Migrated three client codebases from CRA to Next.js App Router with no feature freeze",
      "Established the component library that became Prism, now 2.4k stars and 18k weekly installs",
      "Cut CI runtime 68% by splitting the test suite and caching aggressively",
    ],
    stack: ["React", "Next.js", "Node.js", "ClickHouse", "Kafka", "Docker"],
  },
  {
    company: "Freelance",
    role: "Web & Automation Developer",
    type: "Freelance",
    location: "Remote",
    start: "2019",
    end: "2021",
    summary:
      "Shipped 20+ projects for founders and small teams, mostly the first version of something.",
    achievements: [
      "Delivered marketing sites, dashboards and internal tools across a dozen industries",
      "Built the invoice automation that later became Harbor, saving one client 31 hours a week",
      "Learned to scope, quote and say no — the skills that made everything after this possible",
    ],
    stack: ["React", "Node.js", "MongoDB", "Python", "Stripe"],
  },
];

/* -------------------------------------------------------------------------- */
/*  9. Education & credentials                                                */
/* -------------------------------------------------------------------------- */

export const education: Education[] = [
  {
    institution: "University of Engineering & Technology",
    qualification: "BSc",
    field: "Computer Science",
    start: "2017",
    end: "2021",
    location: "Lahore, PK",
    detail:
      "Focused on distributed systems and machine learning. Final-year project was a document retrieval system — the same problem I still work on, with considerably worse results.",
    highlights: [
      "Graduated with distinction (CGPA 3.8/4.0)",
      "Led the university ACM chapter for two years",
      "Published an undergraduate paper on hybrid search ranking",
    ],
  },
];

export const certificates: Certificate[] = [
  {
    name: "AWS Certified Solutions Architect – Associate",
    issuer: "Amazon Web Services",
    year: "2024",
    credentialUrl: "https://aws.amazon.com/verification",
  },
  {
    name: "Deep Learning Specialization",
    issuer: "DeepLearning.AI",
    year: "2023",
    credentialUrl: "https://coursera.org/verify/specialization",
  },
  {
    name: "Machine Learning Engineering for Production (MLOps)",
    issuer: "DeepLearning.AI",
    year: "2023",
  },
  {
    name: "Professional Data Engineer",
    issuer: "Google Cloud",
    year: "2022",
  },
  {
    name: "Advanced React & Performance Patterns",
    issuer: "Frontend Masters",
    year: "2022",
  },
  {
    name: "Certified Kubernetes Application Developer",
    issuer: "The Linux Foundation",
    year: "2021",
  },
];

/* -------------------------------------------------------------------------- */
/*  10. Services                                                              */
/* -------------------------------------------------------------------------- */

export const services: Service[] = [
  {
    title: "AI Development",
    description:
      "Retrieval systems, agents and LLM features built for production from day one — with the eval harness that proves they work.",
    icon: "sparkles",
    deliverables: [
      "Retrieval architecture and corpus strategy",
      "Graded eval set and CI regression gates",
      "Cost and latency budgets you can hold to",
    ],
    startingAt: "From $9k",
  },
  {
    title: "Web Development",
    description:
      "Next.js applications that stay fast as the data grows. Server components, streaming, and a Lighthouse score that survives launch.",
    icon: "layout",
    deliverables: [
      "Design system and component library",
      "SEO, accessibility and Core Web Vitals pass",
      "Analytics and error monitoring wired in",
    ],
    startingAt: "From $6k",
  },
  {
    title: "Automation",
    description:
      "Find the manual step that costs a team a day a week and remove it — using models only where the task is genuinely ambiguous.",
    icon: "zap",
    deliverables: [
      "Process audit with a measured time baseline",
      "Event-driven pipeline with audit trail",
      "Human review queue for the edge cases",
    ],
    startingAt: "From $5k",
  },
  {
    title: "API Development",
    description:
      "Typed, versioned, documented APIs. Contracts that hold, errors that explain themselves, and load tests before launch.",
    icon: "server",
    deliverables: [
      "OpenAPI or tRPC contract with generated clients",
      "Auth, rate limiting and idempotency",
      "Load test report against your traffic shape",
    ],
    startingAt: "From $5k",
  },
  {
    title: "Full Stack Builds",
    description:
      "Zero to launched product. One person across the whole stack means no handoff gaps and no arguing across a boundary.",
    icon: "layers",
    deliverables: [
      "Product scoping and technical plan",
      "Complete build across frontend, backend and infra",
      "Handover with documentation and a runbook",
    ],
    startingAt: "From $14k",
  },
  {
    title: "Consulting",
    description:
      "A second opinion with skin in the game. Architecture review, AI strategy, or an honest read on whether the thing you want is the thing you need.",
    icon: "compass",
    deliverables: [
      "Architecture and codebase review",
      "Written findings with prioritised actions",
      "Follow-up sessions with your team",
    ],
    startingAt: "$300 / hr",
  },
];

/* -------------------------------------------------------------------------- */
/*  11. Testimonials                                                          */
/* -------------------------------------------------------------------------- */

export const testimonials: Testimonial[] = [
  {
    quote:
      "We had a demo that impressed everyone and worked for no one. Farhan rebuilt it around an eval harness in six weeks, and for the first time we could actually tell whether a change made the product better.",
    name: "Priya Raghavan",
    role: "VP Engineering",
    company: "Northwind Labs",
  },
  {
    quote:
      "The dashboard went from nine seconds to instant. What impressed me more was that he explained the trade-off he was making, in writing, before he made it.",
    name: "Tomas Lindqvist",
    role: "Head of Product",
    company: "Cadence",
  },
  {
    quote:
      "He scoped the work down twice before starting, and both times he was right. We shipped in half the time I'd budgeted and the thing we cut turned out not to matter.",
    name: "Amara Osei",
    role: "Founder",
    company: "Fieldnote",
  },
  {
    quote:
      "Our finance team was drowning in invoices. Eight weeks later, 78% post themselves and the rest arrive pre-flagged. The audit trail alone paid for the project.",
    name: "Daniel Brooks",
    role: "Finance Director",
    company: "Harborline Group",
  },
  {
    quote:
      "Rare combination: he'll argue with you about the architecture and then write the interface copy. Both were better for it.",
    name: "Sofia Marchetti",
    role: "Design Lead",
    company: "Sable Interactive",
  },
];

/* -------------------------------------------------------------------------- */
/*  12. Tech stack marquee                                                    */
/* -------------------------------------------------------------------------- */

export const techStack: TechItem[] = [
  { name: "TypeScript", icon: "typescript", color: "#3178C6" },
  { name: "React", icon: "react", color: "#61DAFB" },
  { name: "Next.js", icon: "nextjs", color: "#FFFFFF" },
  { name: "Node.js", icon: "nodejs", color: "#5FA04E" },
  { name: "Python", icon: "python", color: "#3776AB" },
  { name: "PostgreSQL", icon: "postgresql", color: "#4169E1" },
  { name: "Redis", icon: "redis", color: "#FF4438" },
  { name: "Docker", icon: "docker", color: "#2496ED" },
  { name: "AWS", icon: "aws", color: "#FF9900" },
  { name: "Vercel", icon: "vercel", color: "#FFFFFF" },
  { name: "Tailwind CSS", icon: "tailwind", color: "#38BDF8" },
  { name: "PyTorch", icon: "pytorch", color: "#EE4C2C" },
  { name: "GraphQL", icon: "graphql", color: "#E10098" },
  { name: "Three.js", icon: "threejs", color: "#FFFFFF" },
  { name: "Prisma", icon: "prisma", color: "#2D3748" },
  { name: "Figma", icon: "figma", color: "#F24E1E" },
];

/* -------------------------------------------------------------------------- */
/*  13. GitHub                                                                */
/* -------------------------------------------------------------------------- */

export const githubStats: GitHubStats = {
  username: "farhanasghar",
  profileUrl: "https://github.com/farhanasghar",
  repositories: 87,
  followers: 1240,
  following: 183,
  stars: 3900,
  contributionsLastYear: 1846,
  longestStreak: 94,
  currentStreak: 21,
  languages: [
    { name: "TypeScript", percentage: 41, color: "#3178C6" },
    { name: "Python", percentage: 27, color: "#3776AB" },
    { name: "JavaScript", percentage: 14, color: "#F7DF1E" },
    { name: "Go", percentage: 8, color: "#00ADD8" },
    { name: "Rust", percentage: 5, color: "#DEA584" },
    { name: "Other", percentage: 5, color: "#94A3B8" },
  ],
};

/* -------------------------------------------------------------------------- */
/*  14. Site metadata                                                         */
/* -------------------------------------------------------------------------- */

export const siteConfig = {
  name: `${profile.name} — ${profile.role}`,
  shortTitle: profile.name,
  description: profile.bio,
  /** Set to your deployed origin. Used for canonical URLs, OG tags and sitemap. */
  url: "https://farhanasghar.dev",
  keywords: [
    "AI engineer",
    "RAG systems",
    "LLM applications",
    "Next.js developer",
    "full-stack engineer",
    "machine learning",
    "AI agents",
    profile.name,
  ],
  locale: "en_US",
} as const;
