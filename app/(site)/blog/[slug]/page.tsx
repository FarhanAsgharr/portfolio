import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { posts } from "@/data/blog";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getContent();
  const post = posts.find((item) => item.slug === slug);
  if (!post) return buildMetadata(content, { title: "Post not found" });

  return buildMetadata(content, {
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = posts.find((item) => item.slug === slug);
  if (!post) notFound();

  return (
    <article className="container-page pt-32 pb-(--spacing-section)">
      <Reveal>
        <Link
          href="/blog"
          className="group inline-flex items-center gap-2 font-mono text-eyebrow text-faint uppercase transition-colors duration-300 hover:text-content"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5" />
          All writing
        </Link>
      </Reveal>

      <header className="mt-10 max-w-3xl">
        <Reveal>
          <div className="flex flex-wrap items-center gap-3">
            <time
              dateTime={post.date}
              className="font-mono text-eyebrow text-faint uppercase tabular-nums"
            >
              {formatDate(post.date)}
            </time>
            <span className="text-faint">·</span>
            <span className="font-mono text-eyebrow text-faint uppercase">
              {post.readingTime} min read
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-6 text-h1">{post.title}</h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-6 text-lead text-muted">{post.excerpt}</p>
        </Reveal>

        <Reveal delay={0.18}>
          <ul className="mt-7 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline" size="md">
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        </Reveal>
      </header>

      {/* Measure capped at ~68 characters — the whole point of a reading page. */}
      <div className="mt-14 max-w-[38rem]">
        {post.body.map((block, index) => {
          const key = `${block.type}-${index}`;

          if (block.type === "h2") {
            return (
              <Reveal key={key}>
                <h2 className="mt-14 mb-5 text-h2 first:mt-0">{block.text}</h2>
              </Reveal>
            );
          }

          if (block.type === "quote") {
            return (
              <Reveal key={key}>
                <blockquote className="my-10 border-l-2 border-[var(--brand-primary)] pl-6">
                  <p className="font-display text-[1.25rem] leading-snug tracking-tight text-content">
                    {block.text}
                  </p>
                </blockquote>
              </Reveal>
            );
          }

          if (block.type === "code") {
            return (
              <Reveal key={key}>
                <pre className="my-8 overflow-x-auto rounded-xl border border-line bg-[var(--surface-inset)]/70 p-5">
                  <code className="font-mono text-[0.8125rem] leading-relaxed text-muted">
                    {block.text}
                  </code>
                </pre>
              </Reveal>
            );
          }

          return (
            <Reveal key={key}>
              <p className="mb-6 text-[1.0625rem] leading-[1.75] text-muted">{block.text}</p>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <div className="mt-16 max-w-[38rem] border-t border-line pt-8">
          <Link
            href="/#contact"
            className="font-display text-h3 tracking-tight transition-colors duration-300 hover:text-primary"
          >
            Working on something like this? →
          </Link>
        </div>
      </Reveal>
    </article>
  );
}
