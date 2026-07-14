import { fakeOfficialConnector } from "../src/lib/connectors/fake-official";
import { upsertConnectorListings } from "../src/lib/connectors/upsert-listings";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await fakeOfficialConnector.fetchListings({
    modelNumber: "AH-4200",
  });
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
