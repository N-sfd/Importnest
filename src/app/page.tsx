import Link from "next/link";
import { ApprovedSourcesStrip } from "@/components/ApprovedSourcesStrip";
import { BackendLinks } from "@/components/BackendLinks";
import { DepartmentGrid } from "@/components/DepartmentCard";
import { ExampleSearches } from "@/components/ExampleSearches";
import { FeaturedComparison } from "@/components/FeaturedComparison";
import { HeroSearch } from "@/components/HeroSearch";
import { HowItWorks } from "@/components/HowItWorks";
import { PageShell } from "@/components/PageShell";
import { PopularComparisonsSection } from "@/components/PopularComparisonCard";
import { RecentSearches } from "@/components/RecentSearches";
import { SavedAlertsPreview } from "@/components/SavedAlertsPreview";
import { getAuthUser } from "@/lib/auth";
import { categoryImages } from "@/lib/images";
import { getPopularComparisons } from "@/lib/popular-comparisons";
import { prisma } from "@/lib/prisma";
import { getRecentSearches } from "@/lib/recent-searches";
import { getUserWatchlist } from "@/lib/saved-data";

const categories = [
  {
    name: "Home",
    desc: "Furniture and smart home",
    href: "/search?category=home",
    image: categoryImages.home,
  },
  {
    name: "Electronics",
    desc: "Phones, computers, audio & TVs",
    href: "/search?category=electronics",
    image: categoryImages.electronics,
  },
  {
    name: "Appliances",
    desc: "Kitchen and laundry",
    href: "/search?category=appliances",
    image: categoryImages.appliances,
  },
  {
    name: "Footwear",
    desc: "New and resale options",
    href: "/search?category=footwear",
    image: categoryImages.footwear,
  },
  {
    name: "Beauty",
    desc: "Devices and personal care",
    href: "/search?category=beauty-devices",
    image: categoryImages.electronics,
  },
  {
    name: "Accessories",
    desc: "Cases, chargers, bags",
    href: "/search?category=accessories",
    image: categoryImages.home,
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
      <section className="relative overflow-hidden rounded-2xl border border-border bg-navy-900 px-5 py-8 text-white shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-ring/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cta/15 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Compare trusted offers in one clear view
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
            Search once. See total known cost, delivery, and protection—sourced only from{" "}
            <Link
              href="#approved-sources"
              className="font-semibold text-cta underline-offset-2 hover:underline"
            >
              approved retailers
            </Link>
            .
          </p>
        </div>

        <HeroSearch />
        <p className="relative mt-3 text-xs text-white/55">
          Estimates are labeled. Sponsored placements never change organic ranking.
        </p>
      </section>

      <ExampleSearches />
      <RecentSearches items={recentSearches} />
      <FeaturedComparison item={popular[0] ?? null} signedIn={Boolean(user)} />
      {user ? <SavedAlertsPreview items={watchlist} /> : null}

      <ApprovedSourcesStrip sources={sources} />

      <div className="mt-8 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Shop by department</h2>
        <Link href="/search?category=appliances" className="text-sm font-semibold text-link hover:underline">
          View all
        </Link>
      </div>
      <DepartmentGrid categories={categories} />

      <PopularComparisonsSection items={popular} signedIn={Boolean(user)} />

      <HowItWorks />

      <BackendLinks className="mt-6" />
    </PageShell>
  );
}
