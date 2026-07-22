import { CartClient } from "@/components/CartClient";
import { PageShell } from "@/components/PageShell";
import { getAuthUser } from "@/lib/auth";
import { getPopularComparisons } from "@/lib/popular-comparisons";
import { prisma } from "@/lib/prisma";

export default async function CartPage() {
  const authUser = await getAuthUser();
  let savedProductIds: string[] = [];
  if (authUser) {
    const saved = await prisma.savedProduct.findMany({
      where: { userId: authUser.id },
      select: { canonicalProductId: true },
      take: 200,
    });
    savedProductIds = saved.map((s) => s.canonicalProductId);
  }

  // Fetched unconditionally since the cart itself lives in client-side
  // localStorage — the server can't know in advance whether it's empty.
  const popularComparisons = await getPopularComparisons(4, new Set(savedProductIds));

  return (
    <PageShell>
      <CartClient
        signedIn={Boolean(authUser)}
        savedProductIds={savedProductIds}
        popularComparisons={popularComparisons}
      />
    </PageShell>
  );
}
