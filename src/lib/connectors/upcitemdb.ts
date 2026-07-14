import type { ConnectorQuery, ConnectorResult, SourceConnector } from "./types";

export const SOURCE_ID = "src-official";

const TRIAL_ENDPOINT = "https://api.upcitemdb.com/prod/trial/lookup";

type UpcItemDbOffer = {
  merchant?: string;
  domain?: string;
  price?: number;
  shipping?: string;
  condition?: string;
  availability?: string;
  link?: string;
};

type UpcItemDbItem = {
  upc?: string;
  model?: string;
  title?: string;
  offers?: UpcItemDbOffer[];
};

type UpcItemDbResponse = {
  code: string;
  items?: UpcItemDbItem[];
};

function normalizeCondition(raw?: string): string {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("used")) return "used";
  return "new";
}

function parseShipping(raw?: string): number {
  const match = raw?.replace(/,/g, "").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function safeUrl(raw?: string): string | undefined {
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? raw : undefined;
  } catch {
    return undefined;
  }
}

export const upcItemDbConnector: SourceConnector = {
  sourceId: SOURCE_ID,
  async fetchListings(query: ConnectorQuery = {}): Promise<ConnectorResult> {
    const fetchedAt = new Date();

    // The free trial endpoint only supports lookup by UPC/EAN, not model-number search.
    if (!query.upc) {
      return { sourceId: SOURCE_ID, listings: [], fetchedAt };
    }

    const response = await fetch(
      `${TRIAL_ENDPOINT}?upc=${encodeURIComponent(query.upc)}`,
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      throw new Error(
        `UPCItemDB request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data: UpcItemDbResponse = await response.json();

    if (data.code !== "OK" || !data.items?.length) {
      return { sourceId: SOURCE_ID, listings: [], fetchedAt };
    }

    const item = data.items[0];
    const upc = item.upc ?? query.upc;

    const listings = (item.offers ?? [])
      .filter((offer) => typeof offer.price === "number")
      .map((offer) => ({
        externalId: `${upc}-${offer.merchant ?? offer.domain ?? "offer"}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
        sellerName: offer.merchant || offer.domain,
        url: safeUrl(offer.link),
        condition: normalizeCondition(offer.condition),
        price: Number(offer.price),
        shipping: parseShipping(offer.shipping),
        fees: 0,
        deliveryLabel: offer.availability || undefined,
        upc,
        mpn: item.model,
        modelName: item.title,
      }));

    return { sourceId: SOURCE_ID, listings, fetchedAt };
  },
};
