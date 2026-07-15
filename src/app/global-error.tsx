"use client";

import { useEffect } from "react";
import Link from "next/link";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-navy-900 antialiased">
        <main className="mx-auto max-w-lg px-4 py-16">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-8 text-center">
            <h1 className="text-xl font-extrabold tracking-tight text-navy-900">
              Something went wrong
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              We hit an unexpected problem loading this page. Try again, or continue from home
              search.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={reset} className="btn-cta px-4 py-2.5 text-sm">
                Try again
              </button>
              <Link
                href="/"
                className="rounded-lg border border-border bg-panel px-4 py-2.5 text-sm font-semibold"
              >
                Home search
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
