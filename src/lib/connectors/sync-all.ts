import { getConnector, listConnectors } from "./registry";
import { upsertConnectorListings } from "./upsert-listings";

export type SyncAllResult = {
  sourceId: string;
  upserted?: number;
  error?: string;
};

/**
 * Runs every registered connector's default (no-query) listing fetch and
 * upserts the results. Each connector is isolated in its own try/catch so
 * one failing/rate-limited source (e.g. UPCItemDB with no UPC to look up,
 * which returns zero listings by design) never stops the others from
 * syncing — used by both the manual `sync:all` script and the cron route.
 */
export async function syncAllConnectors(): Promise<SyncAllResult[]> {
  const results: SyncAllResult[] = [];

  for (const sourceId of listConnectors()) {
    try {
      const connector = getConnector(sourceId);
      const result = await connector.fetchListings();
      const summary = await upsertConnectorListings(result);
      results.push({ sourceId, upserted: summary.upserted });
    } catch (err) {
      results.push({ sourceId, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return results;
}
