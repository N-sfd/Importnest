import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CartClient, CartLineRow, CartSummary, EmptyCart } from "@/components/CartClient";
import type { CartItem } from "@/lib/cart-storage";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "cp-1",
    listingId: "lst-1",
    title: "Apex Quiet Dishwasher",
    brand: "Apex Home",
    imageUrl: "/images/products/dishwasher.png",
    retailerName: "SportLane",
    condition: "New",
    itemPrice: 100,
    shipping: 10,
    fees: 5,
    totalKnownCost: 115,
    quantity: 1,
    addedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Pulls the full opening tag containing a given aria-label, for attribute assertions. */
function tagWithAriaLabel(html: string, label: string): string {
  const match = html.match(new RegExp(`<[a-z]+[^>]*aria-label="${label}"[^>]*>`));
  if (!match) throw new Error(`No element with aria-label "${label}" found`);
  return match[0];
}

describe("CartClient — empty cart state", () => {
  it("shows the empty-cart message and discovery actions when there is no provider (no items)", () => {
    const html = renderToStaticMarkup(
      <CartClient signedIn={false} savedProductIds={[]} popularComparisons={[]} />,
    );
    expect(html).toContain("Your cart is empty");
    expect(html).toContain("Continue shopping");
    expect(html).toContain("View today");
    expect(html).toContain("s deals");
    expect(html).toContain("Browse categories");
    expect(html).not.toContain("Clear cart");
  });
});

describe("EmptyCart", () => {
  it("renders without crashing when there are no popular comparisons", () => {
    const html = renderToStaticMarkup(<EmptyCart popularComparisons={[]} signedIn={false} />);
    expect(html).toContain("Your cart is empty");
  });
});

describe("CartLineRow — renders real listing data", () => {
  it("shows brand, retailer, condition, price, shipping, fees, and total known cost", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem()} unavailable={false} isSaved={false} signedIn={true} />,
    );
    expect(html).toContain("Apex Home");
    expect(html).toContain("SportLane");
    expect(html).toContain("Apex Quiet Dishwasher");
    expect(html).toContain("New");
    expect(html).toContain("$100.00");
    expect(html).toContain("$10.00");
    expect(html).toContain("$5.00");
    expect(html).toContain("$115.00");
  });

  it("shows a 'View offers' link to the product's compare page", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem()} unavailable={false} isSaved={false} signedIn={true} />,
    );
    expect(html).toContain('href="/compare/cp-1"');
    expect(html).toContain("View offers");
  });

  it("shows 'Continue to retailer' only when a listingId is present", () => {
    const withListing = renderToStaticMarkup(
      <CartLineRow item={makeItem({ listingId: "lst-1" })} unavailable={false} isSaved={false} signedIn={true} />,
    );
    expect(withListing).toContain("Continue to retailer");

    const withoutListing = renderToStaticMarkup(
      <CartLineRow
        item={makeItem({ listingId: undefined })}
        unavailable={false}
        isSaved={false}
        signedIn={true}
      />,
    );
    expect(withoutListing).not.toContain("Continue to retailer");
  });
});

describe("CartLineRow — missing shipping/fees never fabricate $0", () => {
  it("shows 'Not provided' for missing shipping and fees", () => {
    const html = renderToStaticMarkup(
      <CartLineRow
        item={makeItem({ shipping: undefined, fees: undefined })}
        unavailable={false}
        isSaved={false}
        signedIn={true}
      />,
    );
    expect(html).toContain("Not provided");
    expect(html).not.toContain("$0.00");
  });
});

describe("CartLineRow — save for later", () => {
  it("shows 'Save for later' when signed in and not yet saved", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem()} unavailable={false} isSaved={false} signedIn={true} />,
    );
    expect(html).toContain("Save for later");
  });

  it("shows 'Saved for later' (disabled) when already saved", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem()} unavailable={false} isSaved={true} signedIn={true} />,
    );
    expect(html).toContain("Saved for later");
  });

  it("prompts sign-in to save for later when signed out", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem()} unavailable={false} isSaved={false} signedIn={false} />,
    );
    expect(html).toContain("Sign in to save for later");
  });
});

describe("CartLineRow — quantity controls", () => {
  it("disables the decrease button at quantity 1", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem({ quantity: 1 })} unavailable={false} isSaved={false} signedIn={true} />,
    );
    const tag = tagWithAriaLabel(html, "Decrease quantity of Apex Quiet Dishwasher");
    expect(tag).toContain(`disabled=""`);
  });

  it("enables the decrease button above quantity 1", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem({ quantity: 2 })} unavailable={false} isSaved={false} signedIn={true} />,
    );
    const tag = tagWithAriaLabel(html, "Decrease quantity of Apex Quiet Dishwasher");
    expect(tag).not.toContain(`disabled=""`);
  });

  it("disables the increase button at the max quantity of 10", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem({ quantity: 10 })} unavailable={false} isSaved={false} signedIn={true} />,
    );
    const tag = tagWithAriaLabel(html, "Increase quantity of Apex Quiet Dishwasher");
    expect(tag).toContain(`disabled=""`);
  });

  it("enables the increase button below the max quantity", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem({ quantity: 9 })} unavailable={false} isSaved={false} signedIn={true} />,
    );
    const tag = tagWithAriaLabel(html, "Increase quantity of Apex Quiet Dishwasher");
    expect(tag).not.toContain(`disabled=""`);
  });

  it("exposes an accessible label for the remove action", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem()} unavailable={false} isSaved={false} signedIn={true} />,
    );
    expect(html).toContain('aria-label="Remove Apex Quiet Dishwasher from cart"');
  });
});

describe("CartLineRow — unavailable listing", () => {
  it("shows an unavailable notice instead of price/shipping/fees fields", () => {
    const html = renderToStaticMarkup(
      <CartLineRow item={makeItem()} unavailable={true} isSaved={false} signedIn={true} />,
    );
    expect(html).toContain("no longer available");
    expect(html).not.toContain("Continue to retailer");
  });
});

describe("CartSummary — totals", () => {
  const items = [
    makeItem({ productId: "cp-1", listingId: "lst-1", itemPrice: 100, shipping: 10, fees: 5, totalKnownCost: 115, quantity: 2 }),
    makeItem({ productId: "cp-2", listingId: "lst-2", itemPrice: 50, shipping: 0, fees: 0, totalKnownCost: 50, quantity: 1 }),
  ];

  it("shows item count, subtotal, known shipping, known fees, and Total Known Cost", () => {
    const html = renderToStaticMarkup(<CartSummary items={items} />);
    expect(html).toContain("Cart summary");
    expect(html).toContain(">3<"); // items = 2 + 1
    expect(html).toContain("$250.00"); // subtotal
    expect(html).toContain("$20.00"); // shipping total
    expect(html).toContain("$10.00"); // fees total
    expect(html).toContain("$280.00"); // total known cost
  });

  it("flags shipping/fees as not fully provided instead of implying $0 is final", () => {
    const html = renderToStaticMarkup(
      <CartSummary items={[makeItem({ shipping: undefined, fees: undefined, totalKnownCost: undefined })]} />,
    );
    expect(html).toContain("not fully provided");
  });

  it("shows the demo checkout button and 'no payment is processed' disclaimer", () => {
    const html = renderToStaticMarkup(<CartSummary items={items} />);
    expect(html).toContain("Checkout demo");
    expect(html).toContain("No payment is processed.");
    expect(html).toContain('href="/checkout"');
  });

  it("shows the retailer note only when a listing is present", () => {
    const withListing = renderToStaticMarkup(<CartSummary items={items} />);
    expect(withListing).toContain("Some purchases may be completed on the retailer website.");

    const withoutListing = renderToStaticMarkup(
      <CartSummary items={[makeItem({ listingId: undefined })]} />,
    );
    expect(withoutListing).not.toContain("Some purchases may be completed on the retailer website.");
  });

  it("returns all-zero totals for an empty cart without crashing", () => {
    const html = renderToStaticMarkup(<CartSummary items={[]} />);
    expect(html).toContain("$0.00");
  });
});
