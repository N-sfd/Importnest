import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProtectionDetails } from "@/components/ProtectionDetails";
import {
  PROTECTION_UNAVAILABLE_DETAIL,
  PROTECTION_UNAVAILABLE_LABEL,
} from "@/lib/compare-view";

describe("ProtectionDetails — missing structured data (prop omitted entirely)", () => {
  it("shows the compact unavailable label with an explanatory tooltip", () => {
    const html = renderToStaticMarkup(<ProtectionDetails />);
    expect(html).toContain(PROTECTION_UNAVAILABLE_LABEL);
    expect(html).toContain(PROTECTION_UNAVAILABLE_DETAIL);
    expect(html).not.toContain("Warranty information not provided");
    expect(html).not.toContain("Return policy not provided");
  });
});

describe("ProtectionDetails — neither warranty nor returns provided", () => {
  it("shows the compact unavailable label when the details object is empty", () => {
    const html = renderToStaticMarkup(<ProtectionDetails details={{}} />);
    expect(html).toContain(PROTECTION_UNAVAILABLE_LABEL);
    expect(html).toContain(PROTECTION_UNAVAILABLE_DETAIL);
  });
});

describe("ProtectionDetails — warranty only", () => {
  it("shows only the manufacturer warranty fact, not a return period", () => {
    const html = renderToStaticMarkup(
      <ProtectionDetails details={{ manufacturerWarranty: "1-year manufacturer warranty" }} />,
    );
    expect(html).toContain("1-year manufacturer warranty");
    expect(html).toContain("Manufacturer warranty");
    expect(html).not.toContain("Return period");
    expect(html).not.toContain(PROTECTION_UNAVAILABLE_LABEL);
  });
});

describe("ProtectionDetails — returns only", () => {
  it("shows only the return period fact, not a warranty", () => {
    const html = renderToStaticMarkup(<ProtectionDetails details={{ returnPeriod: "30-day returns" }} />);
    expect(html).toContain("30-day returns");
    expect(html).toContain("Return period");
    expect(html).not.toContain("Manufacturer warranty");
    expect(html).not.toContain("Retailer warranty");
  });
});

describe("ProtectionDetails — both warranty and returns", () => {
  it("shows both facts together", () => {
    const html = renderToStaticMarkup(
      <ProtectionDetails
        details={{
          manufacturerWarranty: "1-year manufacturer warranty",
          returnPeriod: "30-day returns",
        }}
      />,
    );
    expect(html).toContain("1-year manufacturer warranty");
    expect(html).toContain("30-day returns");
    expect(html).not.toContain(PROTECTION_UNAVAILABLE_LABEL);
  });
});

describe("ProtectionDetails — final sale", () => {
  it("shows the final-sale restriction alongside a restocking fee", () => {
    const html = renderToStaticMarkup(
      <ProtectionDetails
        details={{
          restockingFee: "15% restocking fee",
          finalSaleRestriction: "Final sale — no returns",
        }}
      />,
    );
    expect(html).toContain("Restocking fee");
    expect(html).toContain("15% restocking fee");
    expect(html).toContain("Final sale");
    expect(html).toContain("Final sale — no returns");
    expect(html).not.toContain(PROTECTION_UNAVAILABLE_LABEL);
  });
});
