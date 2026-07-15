import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { PrimaryAction, SecondaryAction, StatusPanel } from "@/components/StatusPanel";

export default async function OfferUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ listingId?: string; productId?: string }>;
}) {
  const { listingId, productId } = await searchParams;
  const backHref = productId
    ? `/compare/${productId}`
    : listingId
      ? `/compare`
      : "/";

  return (
    <PageShell width="narrow">
      <StatusPanel
        tone="warn"
        title="Offer link unavailable"
        description="This retailer link is missing or invalid, so we will not open a false URL. The product comparison may still be available with other offers."
        actions={
          <>
            {productId ? (
              <PrimaryAction href={`/compare/${productId}`}>Back to comparison</PrimaryAction>
            ) : (
              <PrimaryAction href="/">Start a new search</PrimaryAction>
            )}
            <SecondaryAction href="/search/results">Browse products</SecondaryAction>
            {!productId ? (
              <Link href={backHref} className="sr-only">
                Home
              </Link>
            ) : null}
          </>
        }
      />
    </PageShell>
  );
}
