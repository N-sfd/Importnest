import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CategoryRoundCarousel, type CategoryRoundCarouselItem } from "@/components/CategoryRoundCarousel";

const items: CategoryRoundCarouselItem[] = [
  { slug: "", label: "Appliances", imageUrl: "/images/categories/appliances.png", href: "/search/results?category=appliances" },
  {
    slug: "refrigerator",
    label: "Refrigerators",
    imageUrl: "/images/products/appliances/refrigerator.jpg",
    href: "/search/results?category=appliances&q=refrigerator",
  },
  {
    slug: "deals",
    label: "Best Deals",
    imageUrl: "/images/categories/deals-badge.svg",
    href: "/search/results?category=appliances&sort=lowest_cost",
    badge: "Deals",
  },
];

describe("CategoryRoundCarousel", () => {
  it("renders a tile per item with round image, label, and href", () => {
    const html = renderToStaticMarkup(
      <CategoryRoundCarousel categorySlug="appliances" items={items} activeSubtype="" />,
    );
    expect(html).toContain("Refrigerators");
    expect(html).toContain("Best Deals");
    expect(html).toContain('href="/search/results?category=appliances&amp;q=refrigerator"');
    expect(html).toContain("round-category-carousel");
    expect(html).toContain("round-category-image");
  });

  it("marks the matching tile active and leaves the rest inactive", () => {
    const html = renderToStaticMarkup(
      <CategoryRoundCarousel categorySlug="appliances" items={items} activeSubtype="refrigerator" />,
    );
    expect(html).toContain('round-category-tile active');
    // Only the refrigerator tile's <li> should carry the active class.
    const activeCount = (html.match(/round-category-tile active/g) ?? []).length;
    expect(activeCount).toBe(1);
  });

  it("highlights the reset tile when there is no active subtype", () => {
    const html = renderToStaticMarkup(
      <CategoryRoundCarousel categorySlug="appliances" items={items} activeSubtype="" />,
    );
    const activeCount = (html.match(/round-category-tile active/g) ?? []).length;
    expect(activeCount).toBe(1);
    expect(html).toContain('aria-current="true"');
  });

  it("renders no broken/empty hrefs", () => {
    const html = renderToStaticMarkup(
      <CategoryRoundCarousel categorySlug="appliances" items={items} activeSubtype="" />,
    );
    expect(html).not.toContain('href=""');
  });

  it("renders nothing when there are no items", () => {
    const html = renderToStaticMarkup(
      <CategoryRoundCarousel categorySlug="kitchen" items={[]} activeSubtype="" />,
    );
    expect(html).toBe("");
  });

  it("shows the heading and subtitle for the category", () => {
    const html = renderToStaticMarkup(
      <CategoryRoundCarousel categorySlug="appliances" items={items} activeSubtype="" />,
    );
    expect(html).toContain("Explore Appliances");
    expect(html).toContain("Total Known Cost");
  });
});
