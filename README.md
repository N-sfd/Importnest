# Importnest

AI-powered shopping comparison platform — see `Importnest_BRD.pdf` for the full business
requirements. This repo is the clickable UI prototype milestone: the core customer and
operations screens from BRD §11, wired to mock data shaped like the BRD's data model (§13),
plus a Prisma schema for the real database work that comes next.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Prisma 6** + SQLite for local dev (swap to Postgres later — see below)

## Getting started (manual, step by step)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up the local database** (SQLite file, zero setup — already committed as a migration,
   not as data)
   ```bash
   npm run db:migrate
   ```
   This creates `prisma/dev.db` from `prisma/migrations/`. If you ever change
   `prisma/schema.prisma`, re-run this command to generate a new migration.

3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

4. **Walk the prototype.** Every screen currently reads from `src/lib/mock-data.ts`, not the
   database — that's intentional for this milestone (fast iteration on UI/flow before wiring
   real sources). Screens:
   - `/` — Home & guided search (BRD §11.2)
   - `/search/clarify` — Search clarification questions (§11.3)
   - `/compare/[productId]` — Cross-retailer comparison, with live priority re-ranking (§11.5)
   - `/compare/[productId]/why/[listingId]` — Recommendation explanation (§11.6)
   - `/saved` — Saved products and alerts (§11.7)
   - `/admin/match-review` — Product match review queue (§11.8)

5. **Explore the data model.**
   ```bash
   npm run db:studio
   ```
   Opens Prisma Studio against the (currently empty) SQLite database so you can see the schema
   from `prisma/schema.prisma` — modeled directly on the BRD's Business Data Dictionary (§13.4).

## Next steps toward a real backend

1. Write a seed script (`prisma/seed.ts`) that inserts the same records currently hardcoded in
   `src/lib/mock-data.ts`, so the UI can read from Postgres/SQLite instead of the mock file.
2. Swap `provider = "sqlite"` for `provider = "postgresql"` in `prisma/schema.prisma` and point
   `DATABASE_URL` in `.env` at a real Postgres instance (e.g. a free tier on Supabase/Neon/Railway).
3. Replace the direct imports of `mock-data.ts` in each page with Prisma queries
   (`@/lib/prisma` client + `prisma.canonicalProduct.findMany(...)`, etc).
4. Add the source-connector layer (BRD §9) once you've picked real approved data sources
   (BRD §23 "Open Decisions Before Build" — this is still an open decision).
5. Add authentication for `/admin/*` routes before this goes anywhere near production.

## Project structure

```
src/
  app/                    Route segments (one folder per URL path)
  components/             Shared UI (Header, PriorityTabs)
  lib/
    types.ts               TypeScript types mirroring BRD §13.4
    mock-data.ts            Mock records used until a real DB is wired up
prisma/
  schema.prisma            Data model mirroring BRD §13.4
  migrations/               Generated SQL migrations
```
