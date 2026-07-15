"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PrimaryAction, SecondaryAction, StatusPanel } from "@/components/StatusPanel";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[route-error]", error);
  }, [error]);

  return (
    <StatusPanel
      tone="warn"
      title="This page could not load"
      description="A temporary problem stopped this view from rendering. Try again, or continue shopping from home."
      actions={
        <>
          <button type="button" onClick={reset} className="btn-cta px-4 py-2.5 text-sm">
            Try again
          </button>
          <PrimaryAction href="/">Home search</PrimaryAction>
          <SecondaryAction href="/search/results">Browse products</SecondaryAction>
          <Link href="/saved" className="text-sm font-semibold text-link hover:underline">
            Watchlist
          </Link>
        </>
      }
    />
  );
}
