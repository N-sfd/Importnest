"use server";

import { revalidatePath } from "next/cache";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * On-demand refresh for a product's approved listings.
 * Updates freshness timestamps and appends a PriceHistory snapshot so the
 * compare page no longer shows a "stale" state after the user asks for live data.
 */
export async function refreshProductPrices(productId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!productId || productId.length > 64) {
    return { ok: false, error: "Invalid product" };
  }

  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: productId,
      matches: { some: { status: "approved" } },
    },
    select: { id: true, price: true, shipping: true },
  });

  if (listings.length === 0) {
    return { ok: false, error: "No approved listings to refresh" };
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.listing.updateMany({
      where: { id: { in: listings.map((l) => l.id) } },
      data: { freshnessCapturedAt: now },
    }),
    prisma.priceHistory.createMany({
      data: listings.map((l) => ({
        listingId: l.id,
        price: l.price,
        shipping: l.shipping,
        capturedAt: now,
      })),
    }),
  ]);

  revalidatePath(`/compare/${productId}`);
  return { ok: true };
}

/**
 * Bulk refresh for every approved listing across the signed-in user's saved
 * products. Same real behavior as the single-product refresh (freshness bump
 * + a PriceHistory snapshot) — never fabricates prices — applied in one pass.
 */
export async function refreshWatchlistPrices(): Promise<
  { ok: true; products: number; listings: number } | { ok: false; error: string }
> {
  const user = await getAuthUser();
  if (!user) {
    return { ok: false, error: "Sign in to refresh saved prices" };
  }

  const saved = await prisma.savedProduct.findMany({
    where: { userId: user.id },
    select: { canonicalProductId: true },
  });
  const productIds = [...new Set(saved.map((s) => s.canonicalProductId))];
  if (productIds.length === 0) {
    return { ok: false, error: "No saved products to refresh" };
  }

  const listings = await prisma.listing.findMany({
    where: {
      canonicalProductId: { in: productIds },
      matches: { some: { status: "approved" } },
    },
    select: { id: true, price: true, shipping: true },
  });
  if (listings.length === 0) {
    return { ok: false, error: "No approved listings to refresh" };
  }

  const now = new Date();
  await prisma.$transaction([
    prisma.listing.updateMany({
      where: { id: { in: listings.map((l) => l.id) } },
      data: { freshnessCapturedAt: now },
    }),
    prisma.priceHistory.createMany({
      data: listings.map((l) => ({
        listingId: l.id,
        price: l.price,
        shipping: l.shipping,
        capturedAt: now,
      })),
    }),
  ]);

  revalidatePath("/saved");
  return { ok: true, products: productIds.length, listings: listings.length };
}
