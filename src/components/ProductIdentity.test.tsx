import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Image from "next/image";
import { formatMatchStatus } from "@/lib/compare-view";
import { BRAND_FALLBACK_IMAGE, productImageFor } from "@/lib/images";

describe("product identity — image", () => {
  it("renders the real product image when one is registered", () => {
    const src = productImageFor("cp-apex-ah4200");
    expect(src).not.toBe(BRAND_FALLBACK_IMAGE);

    const html = renderToStaticMarkup(
      <Image src={src} alt="Apex Home Quiet Dishwasher" width={280} height={280} />,
    );
    expect(html).toContain(src.split("/").pop()!);
  });

  it("falls back to the brand placeholder image when no product image is registered", () => {
    const src = productImageFor("cp-some-unregistered-product");
    expect(src).toBe(BRAND_FALLBACK_IMAGE);

    const html = renderToStaticMarkup(<Image src={src} alt="" width={280} height={280} />);
    const fallbackFilename = BRAND_FALLBACK_IMAGE.split("/").pop()!;
    expect(html).toContain(fallbackFilename);
  });
});

describe("product identity — match status badge", () => {
  it("renders an exact-match label", () => {
    const html = renderToStaticMarkup(<span>{formatMatchStatus("exact", 100)}</span>);
    expect(html).toContain("Exact match · 100%");
  });

  it("renders a comparable-product label", () => {
    const html = renderToStaticMarkup(<span>{formatMatchStatus("comparable", 75)}</span>);
    expect(html).toContain("Comparable product · 75%");
  });
});
