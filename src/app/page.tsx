import Link from "next/link";
import { ApprovedSourcesStrip } from "@/components/ApprovedSourcesStrip";
import { BackendLinks } from "@/components/BackendLinks";
import { CategoryImageGrid } from "@/components/CategoryImageCard";
import { HeroSearch } from "@/components/HeroSearch";
import { HomepageCompareDemo } from "@/components/HomepageCompareDemo";
import { HowItWorks } from "@/components/HowItWorks";
import { PageShell } from "@/components/PageShell";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import { PriceAlertTeaser } from "@/components/PriceAlertTeaser";
import { RecentSearches } from "@/components/RecentSearches";
import { SavedAlertsPreview } from "@/components/SavedAlertsPreview";
import { TotalKnownCostHook } from "@/components/TotalKnownCostHook";
import { getAuthUser } from "@/lib/auth";
import { homeCategoryImages } from "@/lib/images";
import { getPopularComparisons } from "@/lib/popular-comparisons";
import { prisma } from "@/lib/prisma";
import { getRecentSearches } from "@/lib/recent-searches";
import { getUserWatchlist } from "@/lib/saved-data";

const categories = [
  {
    name: "Headphones / Audio",
    desc: "Headphones, speakers & HiFi",
    href: "/search?q=headphones&category=electronics",
    image: homeCategoryImages.headphones,
  },
  {
    name: "Leisure & Outdoors",
    desc: "Gear for travel and outdoor time",
    href: "/search?q=outdoors&category=footwear",
    image: homeCategoryImages.outdoors,
  },
  {
    name: "Automotive",
    desc: "Car accessories and essentials",
    href: "/search?q=automotive",
    image: homeCategoryImages.automotive,
  },
  {
    name: "Appliances",
    desc: "Kitchen and laundry",
    href: "/search?category=appliances",
    image: homeCategoryImages.appliances,
  },
  {
    name: "Electronics",
    desc: "Phones, computers, audio & TVs",
    href: "/search?category=electronics",
    image: homeCategoryImages.electronics,
  },
];

export default async function HomePage() {
  const user = await getAuthUser();
  let savedIds = new Set<string>();
  if (user) {
    const saved = await prisma.savedProduct.findMany({
      where: { userId: user.id },
      select: { canonicalProductId: true },
      take: 50,
    });
    savedIds = new Set(saved.map((s) => s.canonicalProductId));
  }
  const [popular, sources, recentSearches, watchlist] = await Promise.all([
    getPopularComparisons(4, savedIds),
    prisma.source.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    user ? getRecentSearches(user.id, 3) : Promise.resolve([]),
    user ? getUserWatchlist(user.id) : Promise.resolve([]),
  ]);

  return (
    <PageShell>
      {/* 1. Hero / main search */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-navy-100 via-panel to-surface px-5 py-8 shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cta/10 blur-3xl"
        />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-start">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Compare trusted offers in one clear view
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Search once. See{" "}
              <span className="font-semibold text-accent">Total Known Cost</span> — item + shipping +
              fees — from{" "}
              <Link
                href="#approved-sources"
                className="font-semibold text-link underline-offset-2 hover:underline"
              >
                approved retailers
              </Link>{" "}
              only.
            </p>

            <HeroSearch />
            <p className="relative mt-3 text-xs text-muted">
              Estimates are labeled. Sponsored placements never change organic ranking.
            </p>
          </div>

          <TotalKnownCostHook />
        </div>
      </section>

      <RecentSearches items={recentSearches} />

      {/* 2. Shop by Category */}
      <section className="mt-10" aria-labelledby="shop-category-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="shop-category-heading"
              className="text-xl font-bold tracking-tight text-navy-900"
            >
              Shop by Category
            </h2>
            <p className="mt-1 text-sm text-muted">Browse with clear category imagery</p>
          </div>
          <Link
            href="/search?category=electronics"
            className="text-sm font-semibold text-link hover:underline"
          >
            View all
          </Link>
        </div>
        <CategoryImageGrid items={categories} />
      </section>

      {/* 3. Comparison preview — before Popular comparisons */}
      <HomepageCompareDemo />

      {/* 4. Popular comparisons */}
      <PopularComparisonsSection items={popular} signedIn={Boolean(user)} />

      {/* 5. Track Total Known Cost / Alerts */}
      <PriceAlertTeaser
        signedIn={Boolean(user)}
        preview={watchlist[0] ?? null}
      />
      {user ? <SavedAlertsPreview items={watchlist} /> : null}

      {/* 6. How Importnest works */}
      <HowItWorks />

      {/* 7. Approved sources / trust */}
      <div id="approved-sources" className="scroll-mt-24 mt-10">
        <ApprovedSourcesStrip sources={sources} />
      </div>

      <BackendLinks className="mt-6" />
    </PageShell>
  );
}
