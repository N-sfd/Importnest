import Link from "next/link";
import type { ReactNode } from "react";
import { PageShell } from "@/components/PageShell";

/** Shared shell for short, plain-language trust/policy pages (ranking, freshness, affiliate, privacy, terms, reporting). */
export function TrustPageLayout({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <PageShell width="narrow">
      <nav className="mb-3 text-xs text-muted">
        <Link href="/" className="text-link hover:underline">
          Home
        </Link>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{intro}</p>
      <div className="mt-6 space-y-6 pb-8">{children}</div>
    </PageShell>
  );
}

export function TrustSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <div className="mt-1.5 text-sm leading-relaxed text-foreground/85">{children}</div>
    </section>
  );
}
