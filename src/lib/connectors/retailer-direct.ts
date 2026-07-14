import type { ConnectorQuery, ConnectorResult, SourceConnector } from "./types";

export const SOURCE_ID = "src-retailer-direct";

const API_BASE = "https://fakestoreapi.com/products";

type FakeStoreProduct = {
  id: number;
  title: string;
  price: number;
};

/**
 * Fake Store API is a genuinely free, keyless test-data API — good for
 * proving a second connector pipeline end to end, but it has no barcode or
 * model-number data, and no query-by-UPC support. Matching to a
 * CanonicalProduct relies on a synthetic "FSA-<id>" MPN identifier that has
 * to be added to ProductIdentifier manually per product, the same way a
 * real affiliate feed without barcodes would need an explicit SKU mapping.
 */
export const retailerDirectConnector: SourceConnector = {
  sourceId: SOURCE_ID,
  async fetchListings(query: ConnectorQuery = {}): Promise<ConnectorResult> {
    const fetchedAt = new Date();

    const singleId = query.modelNumber?.match(/^\d+$/) ? query.modelNumber : undefined;
    const url = singleId ? `${API_BASE}/${singleId}` : API_BASE;

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      throw new Error(`Fake Store API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const products: FakeStoreProduct[] = Array.isArray(data) ? data : [data];

    const listings = products.map((p) => ({
      externalId: String(p.id),
      condition: "new",
      price: p.price,
      mpn: `FSA-${p.id}`,
      modelName: p.title,
      // No real product page exists for this test catalog, so no url is set —
      // the UI already handles a missing retailer link gracefully.
    }));

    return { sourceId: SOURCE_ID, listings, fetchedAt };
  },
};
