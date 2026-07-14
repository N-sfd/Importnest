export type ConnectorListing = {
    externalId: string;
    sellerName?: string;
    url?: string;
    condition: string;
    price: number;
    shipping?: number;
    fees?: number;
    deliveryLabel?: string;
    /** Optional product identity for matching */
    upc?: string;
    mpn?: string;
    modelName?: string;
  };
  
  export type ConnectorResult = {
    sourceId: string;
    listings: ConnectorListing[];
    fetchedAt: Date;
  };
  
  export type ConnectorQuery = {
    modelNumber?: string;
    upc?: string;
  };
  
  export interface SourceConnector {
    sourceId: string;
    fetchListings(query?: ConnectorQuery): Promise<ConnectorResult>;
  }