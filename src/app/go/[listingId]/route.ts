import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isSafeRetailerUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> },
) {
  const { listingId } = await params;
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });

  if (!listing?.url || !isSafeRetailerUrl(listing.url)) {
    return NextResponse.json({ error: "No retailer link available for this listing" }, { status: 404 });
  }

  await prisma.outboundReferral.create({
    data: { listingId: listing.id, referralToken: randomUUID() },
  });

  return NextResponse.redirect(listing.url);
}
