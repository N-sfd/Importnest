import { prisma } from "@/lib/prisma";
import type { ConnectorResult } from "./types";

export async function upsertConnectorListings(result: ConnectorResult) {
  const source = await prisma.source.findUnique({ where: { id: result.sourceId } });
  if (!source || !source.isActive) {
    throw new Error(`Source not found or inactive: ${result.sourceId}`);
  }

  let upserted = 0;

  for (const item of result.listings) {
    // Match canonical product by UPC or MPN when possible
    const identifier = item.upc
      ? await prisma.productIdentifier.findUnique({ where: { value: item.upc } })
      : item.mpn
        ? await prisma.productIdentifier.findFirst({
            where: { type: "MPN", value: item.mpn },
          })
        : null;

    const canonicalProductId = identifier?.canonicalProductId ?? null;

    // Keep stable ids for the stub so re-sync updates the same row
    const listingId =
      result.sourceId === "src-official" && item.externalId === "official-ah-4200"
        ? "listing-official"
        : undefined;

    const listing = await prisma.listing.upsert({
      where: { id: listingId ?? `listing-${result.sourceId}-${item.externalId}` },
      create: {
        id: listingId ?? `listing-${result.sourceId}-${item.externalId}`,
        sourceId: result.sourceId,
        canonicalProductId,
        condition: item.condition,
        price: item.price,
        shipping: item.shipping ?? 0,
        fees: item.fees ?? 0,
        deliveryLabel: item.deliveryLabel,
        freshnessCapturedAt: result.fetchedAt,
      },
      update: {
        canonicalProductId,
        condition: item.condition,
        price: item.price,
        shipping: item.shipping ?? 0,
        fees: item.fees ?? 0,
        deliveryLabel: item.deliveryLabel,
        freshnessCapturedAt: result.fetchedAt,
      },
    });

    await prisma.priceHistory.create({
      data: {
        listingId: listing.id,
        price: item.price,
        shipping: item.shipping ?? 0,
        capturedAt: result.fetchedAt,
      },
    });

    if (canonicalProductId) {
      await prisma.productMatch.upsert({
        where: { id: `match-${listing.id}` },
        create: {
          id: `match-${listing.id}`,
          canonicalProductId,
          listingId: listing.id,
          type: "exact",
          confidence: 0.98,
          status: "approved",
        },
        update: {
          confidence: 0.98,
          status: "approved",
        },
      });
    }

    upserted += 1;
  }

  return { sourceId: result.sourceId, upserted };
}