import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { NodeLabel } from "@/components/ui/section";
import { getContent } from "@/lib/content";

export default async function NotFound() {
  const { navigation } = await getContent();

  return (
    <div className="container-page flex min-h-[100svh] flex-col justify-center py-32">
      <div className="max-w-2xl">
        <NodeLabel>404</NodeLabel>

        <h1 className="mt-6 text-display font-semibold">
          <span className="block">Nothing</span>
          <span className="text-gradient block">at this path.</span>
        </h1>

        <p className="mt-8 max-w-md text-lead text-muted">
          The page you asked for doesn&apos;t exist — either it moved or the link was wrong. Here
          are the places that do exist.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/">
              <ArrowLeft />
              Back home
            </Link>
          </Button>
          <Button asChild variant="glass" size="lg">
            <Link href="/blog">Read the writing</Link>
          </Button>
        </div>

        <ul className="mt-14 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-8">
          {navigation.map((item) => (
            <li key={item.id}>
              <Link
                href={`/${item.href}`}
                className="font-mono text-sm text-faint transition-colors duration-300 hover:text-content"
              >
                {item.label.toLowerCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
