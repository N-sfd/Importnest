import { getConnector, listConnectors } from "../src/lib/connectors/registry";
import { upsertConnectorListings } from "../src/lib/connectors/upsert-listings";
import { prisma } from "../src/lib/prisma";

const [sourceId, query] = process.argv.slice(2);

async function main() {
  if (!sourceId) {
    console.error(
      `Usage: npm run sync -- <sourceId> [query]\nAvailable sources: ${listConnectors().join(", ")}`,
    );
    process.exit(1);
  }

  const connector = getConnector(sourceId);
  // Each connector only reads the query field it understands (e.g. upc for
  // upcItemDbConnector, modelNumber for retailerDirectConnector), so passing
  // the same raw value under both keys lets one CLI arg work across connectors.
  const result = await connector.fetchListings(query ? { upc: query, modelNumber: query } : undefined);
  const summary = await upsertConnectorListings(result);
  console.log("Sync complete:", summary);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
