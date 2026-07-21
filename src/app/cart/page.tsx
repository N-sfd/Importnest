import { CartClient } from "@/components/CartClient";
import { PageShell } from "@/components/PageShell";
import { getAuthUser } from "@/lib/auth";
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

  return (
    <PageShell>
      <CartClient signedIn={Boolean(authUser)} savedProductIds={savedProductIds} />
    </PageShell>
  );
}
