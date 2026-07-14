import { upcItemDbConnector } from "../src/lib/connectors/upcitemdb";
import { upsertConnectorListings } from "../src/lib/connectors/upsert-listings";
import { prisma } from "../src/lib/prisma";

// Real-world UPC used for smoke-testing; swap for the UPC you want to sync.
const DEMO_UPC = process.argv[2] ?? "885909950805";

async function main() {
  const result = await upcItemDbConnector.fetchListings({ upc: DEMO_UPC });
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
