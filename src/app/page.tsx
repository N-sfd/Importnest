import Link from "next/link";
import { ApprovedSourcesStrip } from "@/components/ApprovedSourcesStrip";
import { BackendLinks } from "@/components/BackendLinks";
import { CategoryImageGrid } from "@/components/CategoryImageCard";
import { HeroSearch } from "@/components/HeroSearch";
import {
  HomePersonalizationRail,
  HomeTrustCard,
} from "@/components/HomePersonalizationRail";
import { HowItWorks } from "@/components/HowItWorks";
import { PageShell } from "@/components/PageShell";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import { TotalKnownCostHook } from "@/components/TotalKnownCostHook";
import {
  TopProductsSection,
  withTopProductBadges,
} from "@/components/TopProductsSection";
import { BestDealsSection } from "@/components/BestDealsSection";
import { getAuthUser } from "@/lib/auth";
import { getBestDeals } from "@/lib/best-deals";
import { categoryDescriptionFor } from "@/lib/category-visuals";
import { categoryImageFor } from "@/lib/images";
import { getPopularComparisons } from "@/lib/popular-comparisons";
import { prisma } from "@/lib/prisma";
import { getRecentSearches } from "@/lib/recent-searches";
import { getUserWatchlist } from "@/lib/saved-data";

const categories = [
  {
    name: "Headphones / Audio",
    desc: categoryDescriptionFor("electronics"),
    href: "/search?q=headphones&category=electronics",
    image: categoryImageFor("headphones"),
  },
  {
    name: "Leisure & Outdoors",
    desc: categoryDescriptionFor("outdoors"),
    href: "/search?q=outdoors&category=footwear",
    image: categoryImageFor("outdoors"),
  },
  {
    name: "Automotive",
    desc: categoryDescriptionFor("automotive"),
    href: "/search?q=automotive",
    image: categoryImageFor("automotive"),
  },
  {
    name: "Appliances",
    desc: categoryDescriptionFor("appliances"),
    href: "/search?category=appliances",
    image: categoryImageFor("appliances"),
  },
  {
    name: "Electronics",
    desc: categoryDescriptionFor("electronics"),
    href: "/search?category=electronics",
    image: categoryImageFor("electronics"),
  },
  {
    name: "Kitchen",
    desc: categoryDescriptionFor("kitchen"),
    href: "/search?category=kitchen",
    image: categoryImageFor("kitchen"),
  },
  {
    name: "Footwear",
    desc: categoryDescriptionFor("footwear"),
    href: "/search?category=footwear",
    image: categoryImageFor("footwear"),
  },
  {
    name: "Beauty",
    desc: categoryDescriptionFor("beauty"),
    href: "/search?category=beauty",
    image: categoryImageFor("beauty"),
  },
  {
    name: "Accessories",
    desc: categoryDescriptionFor("accessories"),
    href: "/search?category=accessories",
    image: categoryImageFor("accessories"),
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
  const [popular, topProductsRaw, bestDeals, sources, recentSearches, watchlist] =
    await Promise.all([
      getPopularComparisons(4, savedIds),
      getPopularComparisons(6, savedIds),
      getBestDeals(6, savedIds),
      prisma.source.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      user ? getRecentSearches(user.id, 3) : Promise.resolve([]),
      user ? getUserWatchlist(user.id) : Promise.resolve([]),
    ]);
  const topProducts = withTopProductBadges(topProductsRaw);
  const showSidebar =
    recentSearches.length > 0 || (Boolean(user) && watchlist.length > 0);

  return (
    <PageShell width="wide">
      <div className={`flex items-start gap-8 ${showSidebar ? "" : ""}`}>
        <div className="home-container min-w-0 flex-1 px-0">
          {/* 1. Compact category landing entry */}
          <section className="home-section mb-8 rounded-2xl border border-border bg-panel px-5 py-5 shadow-[var(--shadow-panel)] sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-accent">
                  Compare across approved retailers
                </p>
                <h1 className="mt-1 text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl">
                  Find products worth comparing
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Browse a category or search from the header — we show Total Known Cost before you
                  buy.
                </p>
              </div>
              <Link
                href="/search?category=electronics"
                className="btn-cta shrink-0 px-4 py-2.5 text-sm"
              >
                Start browsing
              </Link>
            </div>
          </section>

          <HomePersonalizationRail
            recentSearches={recentSearches}
            watchlist={watchlist}
            showWatchlist={Boolean(user)}
            placement="mobile"
          />

          {/* 2. Shop by Category */}
          <section className="home-section" aria-labelledby="shop-category-heading">
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

          {/* Trust card when no sidebar (fills side space usefully in the main column) */}
          {!showSidebar ? (
            <div className="home-section max-w-md">
              <HomeTrustCard />
            </div>
          ) : null}

          {/* 3. Top Products */}
          <div className="home-section">
            <TopProductsSection items={topProducts} signedIn={Boolean(user)} />
          </div>

          {/* 4. Best Deals */}
          <div className="home-section">
            <BestDealsSection items={bestDeals} signedIn={Boolean(user)} />
          </div>

          {/* 5. Popular Comparisons */}
          <div className="home-section">
            <PopularComparisonsSection items={popular} signedIn={Boolean(user)} />
          </div>

          {/* 6. Compare smarter. Shop confidently. — after Popular comparisons */}
          <section className="home-section relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-navy-100 via-panel to-surface px-5 py-8 shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
            />
            <div className="relative max-w-3xl">
              <h2 className="text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">
                Compare smarter. Shop confidently.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                Search once across{" "}
                <Link
                  href="#approved-sources"
                  className="font-semibold text-link underline-offset-2 hover:underline"
                >
                  approved retailers
                </Link>{" "}
                — then compare the real total cost.
              </p>
              <HeroSearch />
            </div>
          </section>

          {/* 7. See the real total cost */}
          <section className="home-section relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-navy-100 via-panel to-surface px-5 py-8 shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cta/10 blur-3xl"
            />

            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-start">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
                  See the real total cost before you click buy.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                  See{" "}
                  <span className="font-semibold text-accent">Total Known Cost</span> — item +
                  shipping + fees — from approved retailers only. Estimates are labeled.
                  Sponsored placements never change organic ranking.
                </p>
              </div>

              <TotalKnownCostHook />
            </div>
          </section>

          {/* 8. How it works */}
          <div className="home-section">
            <HowItWorks />
          </div>

          {/* 9. Approved sources */}
          <div id="approved-sources" className="home-section scroll-mt-24">
            <ApprovedSourcesStrip sources={sources} />
          </div>

          <BackendLinks className="mt-2" />
        </div>

        <HomePersonalizationRail
          recentSearches={recentSearches}
          watchlist={watchlist}
          showWatchlist={Boolean(user)}
          placement="sidebar"
        />
      </div>
    </PageShell>
  );
}
