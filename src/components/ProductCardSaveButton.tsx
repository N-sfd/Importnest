import Link from "next/link";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";

/** Heart / bookmark overlay on the product image — secondary to View offers. */
export function ProductCardSaveButton({
  productId,
  isSaved,
  signedIn,
  redirectTo,
}: {
  productId: string;
  isSaved: boolean;
  signedIn: boolean;
  redirectTo: string;
}) {
  const className = `product-card-save ${isSaved ? "product-card-save-on" : ""}`;

  if (signedIn) {
    return (
      <form
        action={
          isSaved
            ? unsaveProductAction.bind(null, productId, redirectTo)
            : saveProductAction.bind(null, productId, redirectTo)
        }
        className="product-card-save-form"
      >
        <button
          type="submit"
          className={className}
          aria-label={isSaved ? "Remove from saved" : "Save product"}
          title={isSaved ? "Saved" : "Save"}
        >
          <HeartIcon filled={isSaved} />
        </button>
      </form>
    );
  }

  return (
    <Link
      href={`/login?next=${encodeURIComponent(redirectTo)}`}
      className={className}
      aria-label="Sign in to save"
      title="Save"
    >
      <HeartIcon filled={false} />
    </Link>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 8.6c0 5.4-8.8 11.2-8.8 11.2S3.2 14 3.2 8.6A4.4 4.4 0 0 1 12 6.2a4.4 4.4 0 0 1 8.8 2.4z" />
    </svg>
  );
}
