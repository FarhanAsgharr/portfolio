import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { NodeLabel } from "@/components/ui/section";
import { posts } from "@/data/blog";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata(await getContent(), {
    title: "Writing",
    description:
      "Notes on retrieval systems, agent runtimes and the interfaces around them — written from production, not from the docs.",
    path: "/blog",
  });
}

export default function BlogPage() {
  return (
    <div className="container-page pt-32 pb-(--spacing-section)">
      <header className="max-w-2xl">
        <Reveal>
          <NodeLabel>writing</NodeLabel>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-5 text-h1">Things worth writing down</h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-6 text-lead text-muted">
            Mostly notes to myself that turned out to be useful to other people. All of it comes
            from something that broke in production first.
          </p>
        </Reveal>
      </header>

      <RevealGroup as="ul" stagger={0.07} className="mt-16 border-t border-line">
        {posts.map((post) => (
          <RevealItem as="li" key={post.slug} className="border-b border-line">
            <Link href={`/blog/${post.slug}`} className="group block py-9">
              <div className="grid gap-5 lg:grid-cols-[10rem_minmax(0,1fr)_auto] lg:items-baseline lg:gap-10">
                <time
                  dateTime={post.date}
                  className="font-mono text-eyebrow text-faint uppercase tabular-nums"
                >
                  {formatDate(post.date)}
                </time>

                <div>
                  <h2 className="text-h3 transition-colors duration-300 group-hover:text-primary">
                    {post.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <li key={tag}>
                        <Badge variant="outline">{tag}</Badge>
                      </li>
                    ))}
                    <li>
                      <Badge>{post.readingTime} min read</Badge>
                    </li>
                  </ul>
                </div>

                <ArrowUpRight className="hidden size-5 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-content lg:block" />
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
