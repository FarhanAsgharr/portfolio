import { About } from "@/sections/about";
import { AILab } from "@/sections/ai-lab";
import { Contact } from "@/sections/contact";
import { EducationSection } from "@/sections/education";
import { ExperienceTimeline } from "@/sections/experience";
import { GitHubSection } from "@/sections/github-stats";
import { Hero } from "@/sections/hero";
import { Projects } from "@/sections/projects";
import { Services } from "@/sections/services";
import { Skills } from "@/sections/skills";
import { TechStack } from "@/sections/tech-stack";
import { Testimonials } from "@/sections/testimonials";

/**
 * The home page is pure composition — every section owns its own data, layout
 * and motion, and the order here is the only thing this file decides.
 *
 * Section ids must stay in sync with `spineSections` in `data/portfolio.ts`,
 * which drives both the left-hand spine and the command palette.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Skills />
      <Projects />
      <AILab />
      <ExperienceTimeline />
      <EducationSection />
      <Services />
      <Testimonials />
      <TechStack />
      <GitHubSection />
      <Contact />
    </>
  );
}
