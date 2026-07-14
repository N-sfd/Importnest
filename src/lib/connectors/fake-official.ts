import type { ConnectorQuery, ConnectorResult, SourceConnector } from "./types";

export const SOURCE_ID = "src-official";

export const fakeOfficialConnector: SourceConnector = {
  sourceId: SOURCE_ID,
  async fetchListings(query: ConnectorQuery = {}): Promise<ConnectorResult> {
    // Pretend the feed returned one AH-4200 offer.
    // Later: replace this body with a real HTTP/CSV fetch.
    const listing = {
      externalId: "official-ah-4200",
      condition: "new",
      price: 899,
      shipping: 0,
      fees: 0,
      deliveryLabel: "Thu, free",
      upc: "012345678905",
      mpn: "AH-4200",
      modelName: "Apex Home Quiet Dishwasher",
    };

    const matchesQuery =
      (!query.modelNumber || query.modelNumber === listing.mpn) &&
      (!query.upc || query.upc === listing.upc);

    return {
      sourceId: SOURCE_ID,
      listings: matchesQuery ? [listing] : [],
      fetchedAt: new Date(),
    };
  },
};