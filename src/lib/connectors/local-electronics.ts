import type { ConnectorListing, ConnectorQuery, ConnectorResult, SourceConnector } from "./types";

export const SOURCE_ID = "src-local-electronics";

const API_BASE = "https://dummyjson.com/products";
const FIELDS = "id,title,price,category,sku,shippingInformation,meta";
/** Electronics-only categories, matching this source's "Local Electronics" identity. */
const DEFAULT_CATEGORIES = ["smartphones", "laptops", "tablets", "mobile-accessories"];

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
export function mapDummyJsonProduct(p: DummyJsonProduct): ConnectorListing {
  // meta.barcode is a real-looking 13-digit value from DummyJSON's fixtures —
  // treated as a UPC candidate the same way upcitemdb's response is, but it
  // won't match anything in ProductIdentifier unless an admin has added it,
  // same as retailer-direct's synthetic MPN.
  return {
    externalId: `dj-${p.id}`,
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
 * DummyJSON is a genuinely free, keyless product-data API — a third real
 * connector pipeline, distinct from upcitemdb (UPC-only lookup) and
 * retailer-direct (fixed 20-item catalog, no search). Unlike the trial UPC
 * lookup, it supports real keyword search, so a model-number/keyword query is
 * forwarded there directly; with no query, it pulls the electronics-relevant
 * categories to match this source's "Local Electronics" identity.
 */
export const localElectronicsConnector: SourceConnector = {
  sourceId: SOURCE_ID,
  async fetchListings(query: ConnectorQuery = {}): Promise<ConnectorResult> {
    const fetchedAt = new Date();

    const products = query.modelNumber
      ? await searchProducts(query.modelNumber)
      : (await Promise.all(DEFAULT_CATEGORIES.map(fetchCategory))).flat();

    return { sourceId: SOURCE_ID, listings: products.map(mapDummyJsonProduct), fetchedAt };
  },
};
