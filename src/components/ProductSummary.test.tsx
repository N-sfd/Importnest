import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductSummary } from "@/components/ProductSummary";
import { BRAND_FALLBACK_IMAGE } from "@/lib/images";

const baseProps = {
  imageSrc: "/images/products/dishwasher.png",
  brandName: "Apex Home",
  productName: "Apex Quiet Dishwasher AH-4200",
  modelNumber: "AH-4200",
  matchStatusLabel: "Exact match · 96%",
  offerCount: 3,
  lastCheckedMinutesAgo: 5,
  actions: <button type="button">Save product</button>,
};

describe("ProductSummary — every field present", () => {
  it("renders the image, brand, name, model number, match label, offer count, last checked, and actions", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} />);

    expect(html).toContain("dishwasher.png");
    expect(html).toContain("Apex Home");
    expect(html).toContain("Apex Quiet Dishwasher AH-4200");
    expect(html).toContain("Model");
    expect(html).toContain("AH-4200");
    expect(html).toContain("Exact match · 96%");
    expect(html).toContain("3 offers");
    expect(html).toContain("Updated 5 minutes ago");
    expect(html).toContain("Save product");
  });
});

describe("ProductSummary — missing model number", () => {
  it("omits the model line entirely instead of showing a fake placeholder", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} modelNumber={null} />);

    expect(html).not.toContain("Model");
    expect(html).not.toContain("N/A");
    expect(html).not.toContain("Unknown model");
    // Everything else still renders normally.
    expect(html).toContain("Apex Quiet Dishwasher AH-4200");
  });

  it("also omits it for an empty string, not just null/undefined", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} modelNumber="" />);
    expect(html).not.toContain("Model");
  });
});

describe("ProductSummary — missing product image", () => {
  it("falls back to the neutral brand placeholder, not a broken or fabricated photo", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} imageSrc={BRAND_FALLBACK_IMAGE} />);
    const fallbackFilename = BRAND_FALLBACK_IMAGE.split("/").pop()!;

    expect(html).toContain(fallbackFilename);
    // Fallback thumbnails get extra padding so the brand mark reads as a
    // placeholder, not as a cropped real product photo.
    expect(html).toContain("p-5");
  });
});

describe("ProductSummary — real product image present", () => {
  it("renders the real image with contain crop, not placeholder padding on the img", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} imageSrc="/images/products/air-purifier.png" />);

    expect(html).toContain("air-purifier.png");
    expect(html).toContain("object-contain");
    expect(html).not.toMatch(/class="[^"]*object-contain[^"]*p-5/);
  });
});

describe("ProductSummary — offer count wording", () => {
  it("uses singular 'offer' for exactly one", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} offerCount={1} />);
    expect(html).toContain("1 offer");
    expect(html).not.toContain("1 offers");
  });

  it("shows an honest zero rather than inventing a count", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} offerCount={0} />);
    expect(html).toContain("No offers");
    expect(html).not.toContain("1 offer");
  });
});

describe("ProductSummary — missing last-checked time", () => {
  it("shows an honest unknown last-checked instead of a fabricated timestamp", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} lastCheckedMinutesAgo={null} />);
    expect(html).toContain("Last checked unknown");
    expect(html).not.toContain("Updated");
  });
});

describe("ProductSummary — match status variants", () => {
  it("passes through a comparable-product label as-is", () => {
    const html = renderToStaticMarkup(
      <ProductSummary {...baseProps} matchStatusLabel="Comparable product · 82%" />,
    );
    expect(html).toContain("Comparable product · 82%");
  });

  it("passes through a pending-review label when there's no confidence score yet", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} matchStatusLabel="Match pending review" />);
    expect(html).toContain("Match pending review");
  });
});

describe("ProductSummary — actions slot", () => {
  it("renders Save product / Set alert controls when signed in", () => {
    const html = renderToStaticMarkup(
      <ProductSummary
        {...baseProps}
        actions={
          <>
            <button type="button">Save product</button>
            <button type="button">Set price alert</button>
          </>
        }
      />,
    );
    expect(html).toContain("Save product");
    expect(html).toContain("Set price alert");
  });

  it("renders a sign-in prompt in place of action buttons when signed out", () => {
    const html = renderToStaticMarkup(
      <ProductSummary
        {...baseProps}
        actions={<a href="/login">Sign in to save this product or set a price alert</a>}
      />,
    );
    expect(html).toContain("Sign in to save this product or set a price alert");
    expect(html).not.toContain("Save product");
  });
});

describe("ProductSummary — professional identity, not decorative clutter", () => {
  it("uses a readable product title without oversized hero typography", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} />);
    expect(html).toContain("text-lg font-bold");
    expect(html).not.toContain("text-3xl");
    expect(html).not.toContain("text-4xl");
  });

  it("does not invent a price when no lowest Total Known Cost is passed", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} />);
    expect(html).not.toContain("$");
    expect(html).not.toContain("Total Known Cost");
  });

  it("shows From · Total Known Cost only when a real lowest total is provided", () => {
    const html = renderToStaticMarkup(
      <ProductSummary {...baseProps} lowestTotalKnownCost={849} />,
    );
    expect(html).toContain("From · Total Known Cost");
    expect(html).toContain("$849.00");
  });

  it("renders the match status as a badge", () => {
    const html = renderToStaticMarkup(<ProductSummary {...baseProps} />);
    expect(html).toContain("Exact match · 96%");
    expect(html).toContain("badge-savings");
  });
});
