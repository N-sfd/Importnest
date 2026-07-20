import Link from "next/link";
import { ApprovedSourcesStrip } from "@/components/ApprovedSourcesStrip";
import { BackendLinks } from "@/components/BackendLinks";
import { CategoryImageGrid } from "@/components/CategoryImageCard";
import { HeroSearch } from "@/components/HeroSearch";
import { HomePersonalizationRail } from "@/components/HomePersonalizationRail";
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

/** Idealo-inspired shop-by-category grid — distinct visuals per department. */
const categories = [
  {
    name: "Electronics",
    desc: categoryDescriptionFor("electronics"),
    href: "/search?category=electronics",
    image: categoryImageFor("electronics"),
  },
  {
    name: "Appliances",
    desc: categoryDescriptionFor("appliances"),
    href: "/search?category=appliances",
    image: categoryImageFor("appliances"),
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
    name: "Beauty Devices",
    desc: categoryDescriptionFor("beauty"),
    href: "/search?category=beauty-devices",
    image: categoryImageFor("beauty"),
  },
  {
    name: "Accessories",
    desc: categoryDescriptionFor("accessories"),
    href: "/search?category=accessories",
    image: categoryImageFor("accessories"),
  },
  {
    name: "Automotive",
    desc: categoryDescriptionFor("automotive"),
    href: "/search?category=automotive",
    image: categoryImageFor("automotive"),
  },
  {
    name: "Outdoors",
    desc: categoryDescriptionFor("outdoors"),
    href: "/search?category=outdoors",
    image: categoryImageFor("outdoors"),
  },
  {
    name: "Home",
    desc: categoryDescriptionFor("home"),
    href: "/search?category=home",
    image: categoryImageFor("home"),
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
      getPopularComparisons(8, savedIds),
      getBestDeals(8, savedIds),
      prisma.source.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      user ? getRecentSearches(user.id, 3) : Promise.resolve([]),
      user ? getUserWatchlist(user.id) : Promise.resolve([]),
    ]);
  const topProducts = withTopProductBadges(topProductsRaw);

  return (
    <PageShell width="wide">
      <div className="home-container min-w-0 px-0">
        {/* 1. Shop by Category */}
        <section className="home-section" aria-labelledby="shop-category-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1
                id="shop-category-heading"
                className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl"
              >
                Shop by Category
              </h1>
              <p className="mt-1 text-sm text-muted">
                Browse image-rich departments — then compare Total Known Cost
              </p>
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

        {/* 2. Top Products */}
        <div className="home-section">
          <TopProductsSection items={topProducts} signedIn={Boolean(user)} />
        </div>

        {/* 3. Best Deals */}
        <div className="home-section">
          <BestDealsSection items={bestDeals} signedIn={Boolean(user)} />
        </div>

        {/* 4. Popular Comparisons */}
        <div className="home-section">
          <PopularComparisonsSection items={popular} signedIn={Boolean(user)} />
        </div>

        {/* 5. Compare smarter — mid-page search */}
        <section className="home-section section-soft px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-3xl">
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

        {/* 6. Total Known Cost */}
        <section className="home-section overflow-hidden rounded-2xl border border-border bg-panel px-5 py-8 shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.9fr)] lg:items-start">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
                See the real total cost before you click buy.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                See{" "}
                <span className="font-semibold text-accent">Total Known Cost</span> — item + shipping
                + fees — from approved retailers only. Estimates are labeled. Sponsored placements
                never change organic ranking.
              </p>
            </div>
            <TotalKnownCostHook />
          </div>
        </section>

        {/* 7. Watchlist / recent activity — compact, only when useful */}
        <HomePersonalizationRail
          recentSearches={recentSearches}
          watchlist={watchlist}
          showWatchlist={Boolean(user)}
          placement="inline"
        />

        {/* Mobile recently-viewed (client) */}
        <HomePersonalizationRail
          recentSearches={[]}
          watchlist={[]}
          showWatchlist={false}
          placement="mobile"
        />

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
    </PageShell>
  );
}
