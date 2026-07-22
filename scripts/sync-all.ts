import { syncAllConnectors } from "../src/lib/connectors/sync-all";
import { prisma } from "../src/lib/prisma";

async function main() {
  const results = await syncAllConnectors();
  console.table(results);

  const failed = results.filter((r) => r.error);
  if (failed.length > 0) {
    console.error(`${failed.length}/${results.length} connector(s) failed`);
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
