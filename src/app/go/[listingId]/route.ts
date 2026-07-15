import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSafeRetailerUrl } from "@/lib/compare-view";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing?.url || !isSafeRetailerUrl(listing.url)) {
    const unavailable = new URL("/offer-unavailable", request.url);
    unavailable.searchParams.set("listingId", listingId);
    if (listing?.canonicalProductId) {
      unavailable.searchParams.set("productId", listing.canonicalProductId);
    }
    return NextResponse.redirect(unavailable, 303);
  }

  await prisma.outboundReferral.create({
    data: { listingId: listing.id, referralToken: randomUUID() },
  });

  return NextResponse.redirect(listing.url);
}
