import Link from "next/link";
import { ApprovedSourcesStrip } from "@/components/ApprovedSourcesStrip";
import { CategoryImageGrid } from "@/components/CategoryImageCard";
import { DealProductCard } from "@/components/DealProductCard";
import { HeroSearch } from "@/components/HeroSearch";
import { HomePersonalizationRail } from "@/components/HomePersonalizationRail";
import { HowItWorks } from "@/components/HowItWorks";
import { PageShell } from "@/components/PageShell";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import { TotalKnownCostHook } from "@/components/TotalKnownCostHook";
import { TopProductsSection } from "@/components/TopProductsSection";
import { BestDealsSection } from "@/components/BestDealsSection";
import { getAuthUser } from "@/lib/auth";
import { getBestDeals } from "@/lib/best-deals";
import { categoryDescriptionFor } from "@/lib/category-visuals";
import { categoryImageFor, homeDealImageFor } from "@/lib/images";
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
  const [popularPool, bestPool, sources, recentSearches, watchlist] = await Promise.all([
    getPopularComparisons(40, savedIds),
    getBestDeals(40, savedIds),
    prisma.source.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    user ? getRecentSearches(user.id, 3) : Promise.resolve([]),
    user ? getUserWatchlist(user.id) : Promise.resolve([]),
  ]);

  // Dedupe products across the three rails so the same item (and its image) never
  // appears twice on the homepage.
  const topProducts = popularPool.slice(0, 8);
  const topIds = new Set(topProducts.map((p) => p.productId));
  const bestDeals = bestPool.filter((d) => !topIds.has(d.productId)).slice(0, 8);
  const bestIds = new Set(bestDeals.map((d) => d.productId));
  const popular = popularPool
    .filter((p) => !topIds.has(p.productId) && !bestIds.has(p.productId))
    .slice(0, 4);
  const popularIds = new Set(popular.map((p) => p.productId));
  const todaysDeals = bestPool
    .filter((d) => !topIds.has(d.productId) && !bestIds.has(d.productId) && !popularIds.has(d.productId))
    .slice(0, 8);

  return (
    <PageShell width="wide">
      <div className="home-main">
        {/* Main search hero */}
        <section className="home-band" aria-labelledby="home-search-heading">
          <p className="text-sm font-semibold text-accent">Importnest</p>
          <h1
            id="home-search-heading"
            className="mt-1 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl"
          >
            Search once. Compare every approved offer.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            Search approved retailers, then compare Total Known Cost — item + shipping + fees —
            before you buy.
          </p>
          <HeroSearch className="mt-5" />
        </section>

        {/* Shop by Category */}
        <section className="home-section" aria-labelledby="shop-category-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="shop-category-heading"
                className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl"
              >
                Shop by Category
              </h2>
              <p className="mt-1 text-sm text-muted">
                Browse image-rich departments — then compare offers
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

        {/* Top Products */}
        <div className="home-section">
          <TopProductsSection items={topProducts} signedIn={Boolean(user)} />
        </div>

        {/* Best Deals */}
        <div className="home-section">
          <div className="home-band !mb-0">
            <BestDealsSection items={bestDeals} signedIn={Boolean(user)} />
          </div>
        </div>

        {/* Popular Comparisons */}
        <div className="home-section">
          <PopularComparisonsSection items={popular} signedIn={Boolean(user)} />
        </div>

        {/* Today’s deals */}
        <section className="home-section" aria-labelledby="todays-deals-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="todays-deals-heading"
                className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl"
              >
                Today&apos;s deals
              </h2>
              <p className="mt-1 text-sm text-muted">
                Browse live offers with real Total Known Cost — never invented discounts.
              </p>
            </div>
            <Link
              href="/search?q=deals"
              className="text-sm font-semibold text-link hover:underline"
            >
              View all deals
            </Link>
          </div>

          {todaysDeals.length > 0 ? (
            <ul className="section-grid mt-4">
              {todaysDeals.map((item) => (
                <li key={item.productId} className="min-w-0">
                  <DealProductCard
                    item={item}
                    imageSrc={homeDealImageFor(item.productId, item.categorySlug, item.productName)}
                    signedIn={Boolean(user)}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-border bg-section-soft px-5 py-6 sm:px-7 sm:py-7">
              <p className="text-sm font-semibold text-navy-900">
                Looking for savings backed by approved sources?
              </p>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                Jump into deals search to compare item + shipping + fees across retailers. Sponsored
                placements never change organic ranking.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/search?q=deals" className="btn-cta px-4 py-2.5 text-sm">
                  Shop today&apos;s deals
                </Link>
                <Link
                  href="/search/results?category=electronics"
                  className="rounded-full border border-border bg-panel px-4 py-2.5 text-sm font-semibold text-navy-900 hover:border-navy-800"
                >
                  Electronics deals
                </Link>
                <Link
                  href="/search/results?category=appliances"
                  className="rounded-full border border-border bg-panel px-4 py-2.5 text-sm font-semibold text-navy-900 hover:border-navy-800"
                >
                  Appliance deals
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Compare prices. See the real total cost. */}
        <section
          className="home-section section-soft px-5 py-7 sm:px-8 sm:py-8"
          aria-labelledby="compare-smarter-heading"
        >
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] xl:items-center">
            <div>
              <h2
                id="compare-smarter-heading"
                className="text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl"
              >
                Compare prices. See the real total cost.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Still looking? Search again across{" "}
                <Link
                  href="#approved-sources"
                  className="font-semibold text-link underline-offset-2 hover:underline"
                >
                  approved retailers
                </Link>{" "}
                and refine by category, budget, or model.
              </p>
            </div>
            <div className="min-w-0">
              <HeroSearch className="mt-0" />
            </div>
          </div>
        </section>

          {/* Price alerts / Track Total Known Cost */}
          <section className="home-section" aria-labelledby="track-cost-heading">
            <div className="mb-4">
              <h2
                id="track-cost-heading"
                className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl"
              >
                Price alerts &amp; Total Known Cost
              </h2>
              <p className="mt-1 text-sm text-muted">
                Save favourites, set alerts, and see item + shipping + fees before you click buy.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
              <div className="rounded-2xl border border-border bg-panel px-5 py-6 shadow-[var(--shadow-panel)] sm:px-6">
                <h3 className="text-lg font-bold tracking-tight text-navy-900">
                  Track Total Known Cost
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Sticker price is only part of the story. Importnest shows{" "}
                  <span className="font-semibold text-accent">Total Known Cost</span> from approved
                  sources — estimates are labeled, and sponsored placements never change ranking.
                </p>
                <Link href="/search" className="btn-cta mt-4 inline-flex px-4 py-2.5 text-sm">
                  Start comparing
                </Link>
              </div>
              <TotalKnownCostHook />
            </div>

            <div className="mt-6">
              <HomePersonalizationRail
                recentSearches={recentSearches}
                watchlist={watchlist}
                showWatchlist={Boolean(user)}
                placement="inline"
              />
            </div>
          </section>

          <HomePersonalizationRail
            recentSearches={[]}
            watchlist={[]}
            showWatchlist={false}
            placement="mobile"
          />

          {/* How it works */}
          <div className="home-section">
            <HowItWorks />
          </div>

        {/* Approved sources */}
        <div id="approved-sources" className="home-section scroll-mt-24">
          <ApprovedSourcesStrip sources={sources} />
        </div>
      </div>
    </PageShell>
  );
}
