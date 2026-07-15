import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { BottomSheet } from "@/components/BottomSheet";

describe("BottomSheet — closed by default", () => {
  it("renders an accessible trigger button with the given label", () => {
    const html = renderToStaticMarkup(
      <BottomSheet
        label="Filters"
        title="Filters"
        description="Apply filters. Press Escape to close."
      >
        <p>Filter controls</p>
      </BottomSheet>,
    );
    expect(html).toContain("Filters");
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).toContain('aria-expanded="false"');
  });

  it("does not render the dialog panel content until opened", () => {
    const html = renderToStaticMarkup(
      <BottomSheet
        label="Filters"
        title="Filters"
        description="Apply filters. Press Escape to close."
      >
        <p>Filter controls only visible once open</p>
      </BottomSheet>,
    );
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain("Filter controls only visible once open");
  });

  it("is hidden at the lg breakpoint and up so it never appears on desktop", () => {
    const html = renderToStaticMarkup(
      <BottomSheet label="Filters" title="Filters" description="d">
        <p>x</p>
      </BottomSheet>,
    );
    expect(html).toContain("lg:hidden");
  });

  it("gives the trigger a 44px minimum touch target", () => {
    const html = renderToStaticMarkup(
      <BottomSheet label="Filters" title="Filters" description="d">
        <p>x</p>
      </BottomSheet>,
    );
    expect(html).toContain("min-h-11");
  });
});
