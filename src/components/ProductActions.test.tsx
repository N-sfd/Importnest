import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductActions } from "@/components/ProductActions";

const baseProps = {
  productId: "cp-1",
  redirectTo: "/compare/cp-1",
  suggestedAlert: "50.00",
  currentLowestPrice: 52.5,
};

describe("ProductActions — compact button states", () => {
  it("shows 'Save product' when not saved", () => {
    const html = renderToStaticMarkup(
      <ProductActions {...baseProps} isSaved={false} alert={null} />,
    );
    expect(html).toContain("Save product");
    expect(html).not.toContain(">Saved<");
  });

  it("shows 'Saved' when already saved", () => {
    const html = renderToStaticMarkup(
      <ProductActions {...baseProps} isSaved={true} alert={null} />,
    );
    expect(html).toContain(">Saved<");
  });

  it("shows 'Set price alert' when no alert exists yet", () => {
    const html = renderToStaticMarkup(
      <ProductActions {...baseProps} isSaved={false} alert={null} />,
    );
    expect(html).toContain("Set price alert");
    expect(html).not.toContain("Edit alert");
  });

  it("shows 'Edit price alert' when an alert already exists", () => {
    const html = renderToStaticMarkup(
      <ProductActions
        {...baseProps}
        isSaved={true}
        alert={{ threshold: "45.00", isActive: true }}
      />,
    );
    expect(html).toContain("Edit price alert");
  });
});
