import type { ConnectorListing, ConnectorQuery, ConnectorResult, SourceConnector } from "./types";

export const SOURCE_ID = "src-authorized-outlet";

const API_BASE = "https://api.escuelajs.co/api/v1/products";

type PlatziProduct = {
  id: number;
  title: string;
  price: number;
};

/** Pure so the field mapping is testable without a live network call. */
export function mapPlatziProduct(p: PlatziProduct): ConnectorListing {
  return {
    externalId: `ao-${p.id}`,
    // This API has no condition field of its own — hardcoded to match this
    // source's "Authorized Outlet" identity (certified-refurbished/licensed
    // liquidation stock), the same way retailer-direct's listings are all
    // implicitly "new" for its identity.
    condition: "certified-refurbished",
    price: p.price,
    // No barcode on this API either, so matching relies on a synthetic
    // "AO-<id>" MPN identifier — same pattern as retailer-direct's "FSA-<id>".
    mpn: `AO-${p.id}`,
    modelName: p.title,
  };
}

/**
 * Platzi's Fake Store API (api.escuelajs.co) is a genuinely free, keyless
 * product-data API — a distinct catalog/host from the other two real
 * connectors (upcitemdb, DummyJSON), good for proving this source's own
 * sync pipeline end to end.
 */
export const authorizedOutletConnector: SourceConnector = {
  sourceId: SOURCE_ID,
  async fetchListings(query: ConnectorQuery = {}): Promise<ConnectorResult> {
    const fetchedAt = new Date();

    const url = query.modelNumber
      ? `${API_BASE}/?title=${encodeURIComponent(query.modelNumber)}&limit=20`
      : `${API_BASE}?limit=20&offset=0`;

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`Platzi Fake Store API request failed: ${response.status} ${response.statusText}`);
    }

    const products: PlatziProduct[] = await response.json();
    return { sourceId: SOURCE_ID, listings: products.map(mapPlatziProduct), fetchedAt };
  },
};
