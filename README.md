# Importnest

AI-powered shopping comparison platform. Originally scaffolded as a clickable UI prototype
against mock data (BRD §11/§13); it now runs on a real Postgres database, real authentication,
two working product-data connectors, and a real search flow.

## Stack

- **Next.js 16** (App Router) + **TypeScript** + **Tailwind CSS v4**
- **Prisma 6** + **Postgres** (hosted on Supabase)
- **Supabase Auth** (`@supabase/ssr`) for login/logout
- **Vitest** for regression tests that run against the real dev database

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables** in `.env` (not committed):
   - `DATABASE_URL` — pooled Postgres connection string (Supabase, port 6543)
   - `DIRECT_URL` — direct Postgres connection string (Supabase, port 5432; used for migrations)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or
     `NEXT_PUBLIC_SUPABASE_ANON_KEY`) — from your Supabase project settings

3. **Apply the schema and seed demo data**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

5. **Run tests**
   ```bash
   npm run test
   ```

## Screens

- `/` — Home, with a real search box
- `/search/clarify?q=...` — Exact/near-exact queries (UPC/GTIN lookup for numeric queries, fuzzy
  name/model/brand match otherwise) redirect straight to the compare page. Ambiguous queries get
  clarifying questions (budget, condition, delivery window, preferred brand) — AI-extracted from
  the query first, falling back to a deterministic question set when AI is unavailable — then
  continue to `/search/confirm`, or show a "no match" state with comparable alternatives. Every
  search is recorded as a `SearchSession`, with answers logged to `SearchClarification`.
- `/compare/[productId]` — Cross-retailer comparison. Listings, recommendation ranking, and
  fallback copy (warranty/returns/delivery) are all computed live from real `Listing` rows —
  nothing is hand-authored per product or per listing.
- `/compare/[productId]/why/[listingId]` — Recommendation explanation, cost breakdown, and a
  "Continue to retailer" link that routes through `/go/[listingId]` (validates the retailer URL,
  records an `OutboundReferral`, then redirects)
- `/saved` — Saved products and alerts
- `/admin/match-review` — Product match review queue
- `/login` — Supabase email/password auth

## Data sources

- `src/lib/connectors/upcitemdb.ts` (source `src-official`) — real connector against the
  UPCItemDB trial API (`api.upcitemdb.com/prod/trial/lookup`, no key required, capped at 100
  requests/day). Looks up listings by UPC only; the trial tier has no keyword/model-number
  search. Matches to a `CanonicalProduct` via its `ProductIdentifier` UPC value.
- `src/lib/connectors/retailer-direct.ts` (source `src-retailer-direct`) — real connector against
  the free, keyless Fake Store API (`fakestoreapi.com`). It's a fixed 20-item test catalog with no
  barcode data and no real product pages, so matching uses a synthetic `FSA-<id>` MPN identifier
  (the same pattern a real affiliate feed without UPCs would need) and listings are synced without
  a `url` rather than a fabricated one.
- `src/lib/connectors/local-electronics.ts` (source `src-local-electronics`) — real connector
  against the free, keyless DummyJSON API (`dummyjson.com/products`). Supports real keyword search
  (`/products/search`), unlike the UPCItemDB trial tier; with no query, pulls DummyJSON's
  electronics-relevant categories (smartphones, laptops, tablets, mobile-accessories). Matches to a
  `CanonicalProduct` via `ProductIdentifier` on either DummyJSON's `meta.barcode` (treated as a UPC
  candidate) or its `sku` (treated as an MPN candidate).
- Run a sync manually: `npm run sync:official -- <upc>`, `npm run sync:retailer-direct`, or
  `npm run sync:local-electronics` (or generically, `npm run sync -- <sourceId> [query]` for any
  connector in the registry).
- `src/lib/connectors/registry.ts` maps a `Source.id` to its connector. `src-official`,
  `src-retailer-direct`, and `src-local-electronics` have real connectors; the other seeded sources
  (`src-authorized-outlet`, `src-discount-home`) don't yet.

## Known gaps

- Two of five seeded sources (`src-authorized-outlet`, `src-discount-home`) have no real connector
  yet (see above).
- No scheduled/cron sync — all three connectors are synced manually. The UPCItemDB trial tier also
  caps at 100 requests/day.
- No warranty/return-policy data source exists for any listing, so the UI always shows fallback
  copy ("Warranty information not provided", etc.) rather than a real value.

## Project structure

```
src/
  app/                       Route segments (one folder per URL path)
  components/                Shared UI (Header, PriorityTabs, BackendSourcesPanel, ...)
  lib/
    prisma.ts                 Prisma client singleton
    compare-data.ts            Compare-page data layer (live queries + computed recommendations)
    search-data.ts             Query -> CanonicalProduct matching + SearchSession recording
    connectors/                Source connectors (real + registry)
    supabase/                  Supabase client/server/middleware helpers
prisma/
  schema.prisma                Data model
  migrations/                  Generated SQL migrations
  seed.ts                      Demo data (brand, category, product, sources, listings)
scripts/
  sync.ts                       Manual connector sync CLI (any registered source)
```
