import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { PrimaryAction, SecondaryAction, StatusPanel } from "@/components/StatusPanel";

export default function NotFound() {
  return (
    <PageShell width="narrow">
      <StatusPanel
        title="Page not found"
        description="That link does not match a product, offer, or page in Importnest."
        actions={
          <>
            <PrimaryAction href="/">Go to home search</PrimaryAction>
            <SecondaryAction href="/search/results">Browse products</SecondaryAction>
            <Link href="/saved" className="text-sm font-semibold text-link hover:underline">
              Open watchlist
            </Link>
          </>
        }
      />
    </PageShell>
  );
}
