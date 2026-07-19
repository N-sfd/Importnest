/**
 * One-off backfill: sets averageRating/ratingCount on the 4 real seeded
 * products already living in the shared DB. seed.ts uses `create` and can't
 * re-run against existing ids, so this targeted update fills the same values
 * onto the already-existing rows. Safe to run more than once (idempotent).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RATINGS: Record<string, { averageRating: number; ratingCount: number }> = {
  "cp-apex-ah4200": { averageRating: 4.6, ratingCount: 312 },
  "cp-air-purifier": { averageRating: 4.7, ratingCount: 189 },
  "cp-running-shoe": { averageRating: 4.8, ratingCount: 540 },
  "cp-cordless-vacuum": { averageRating: 4.4, ratingCount: 97 },
};

async function main() {
  for (const [id, data] of Object.entries(RATINGS)) {
    const result = await prisma.canonicalProduct.updateMany({ where: { id }, data });
    console.log(`${id}: matched ${result.count} row(s)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
