import type { ConnectorListing, ConnectorQuery, ConnectorResult, SourceConnector } from "./types";

export const SOURCE_ID = "src-discount-home";

const API_BASE = "https://dummyjson.com/products";
const FIELDS = "id,title,price,category,sku,shippingInformation,meta";
/** Home-relevant categories, matching this source's "Discount Home Supply" identity. */
const DEFAULT_CATEGORIES = ["home-decoration", "furniture", "kitchen-accessories", "groceries"];

type DummyJsonProduct = {
  id: number;
  title: string;
  price: number;
  category?: string;
  sku?: string;
  shippingInformation?: string;
  meta?: { barcode?: string };
};

type DummyJsonListResponse = { products: DummyJsonProduct[] };

/** Pure so the field mapping is testable without a live network call. */
export function mapDummyJsonHomeProduct(p: DummyJsonProduct): ConnectorListing {
  return {
    externalId: `dh-${p.id}`,
    condition: "new",
    price: p.price,
    upc: p.meta?.barcode,
    mpn: p.sku,
    modelName: p.title,
    deliveryLabel: p.shippingInformation,
  };
}

async function fetchCategory(category: string): Promise<DummyJsonProduct[]> {
  const response = await fetch(
    `${API_BASE}/category/${category}?limit=20&select=${FIELDS}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error(`DummyJSON request failed: ${response.status} ${response.statusText}`);
  }
  const data: DummyJsonListResponse = await response.json();
  return data.products;
}

async function searchProducts(term: string): Promise<DummyJsonProduct[]> {
  const response = await fetch(
    `${API_BASE}/search?q=${encodeURIComponent(term)}&limit=20&select=${FIELDS}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error(`DummyJSON request failed: ${response.status} ${response.statusText}`);
  }
  const data: DummyJsonListResponse = await response.json();
  return data.products;
}

/**
 * Same DummyJSON API as the local-electronics connector — a real, free,
 * keyless host — but scoped to home-goods categories to match this source's
 * "Discount Home Supply" (web-extraction) identity. Kept as its own
 * connector file rather than sharing helpers with local-electronics.ts, the
 * same way upcitemdb.ts and retailer-direct.ts don't share fetch/parse code
 * despite both being simple REST connectors.
 */
export const discountHomeConnector: SourceConnector = {
  sourceId: SOURCE_ID,
  async fetchListings(query: ConnectorQuery = {}): Promise<ConnectorResult> {
    const fetchedAt = new Date();

    const products = query.modelNumber
      ? await searchProducts(query.modelNumber)
      : (await Promise.all(DEFAULT_CATEGORIES.map(fetchCategory))).flat();

    return { sourceId: SOURCE_ID, listings: products.map(mapDummyJsonHomeProduct), fetchedAt };
  },
};
