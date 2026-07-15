import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { TrustSection } from "@/components/TrustPageLayout";

// TrustPageLayout itself wraps children in PageShell, which renders an async,
// auth-checking Header — the same reason SearchNoMatch's page-shell wrapper
// isn't unit-tested directly elsewhere in this project. TrustSection (the
// reusable content block every trust page is built from) has no such
// dependency, so it's what's unit-tested here; the full pages are verified
// against a running dev server instead.
describe("TrustSection", () => {
  it("renders a heading and its body content", () => {
    const html = renderToStaticMarkup(
      <TrustSection title="Last checked time">
        <p>Every offer shows when it was last checked.</p>
      </TrustSection>,
    );
    expect(html).toContain("Last checked time");
    expect(html).toContain("Every offer shows when it was last checked.");
  });
});
