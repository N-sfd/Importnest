import Link from "next/link";
import { saveProductAction, unsaveProductAction } from "@/lib/saved-actions";

const ICON_BUTTON_CLASS =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-panel/95 shadow-sm transition hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** Compact Save/heart toggle — sits in the product-card action row alongside Compare and Cart. */
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
  const className = `${ICON_BUTTON_CLASS} ${isSaved ? "text-accent" : "text-navy-900"}`;

  if (signedIn) {
    return (
      <form
        action={
          isSaved
            ? unsaveProductAction.bind(null, productId, redirectTo)
            : saveProductAction.bind(null, productId, redirectTo)
        }
      >
        <button
          type="submit"
          className={className}
          aria-label={isSaved ? "Remove from saved" : "Save product"}
          aria-pressed={isSaved}
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 8.6c0 5.4-8.8 11.2-8.8 11.2S3.2 14 3.2 8.6A4.4 4.4 0 0 1 12 6.2a4.4 4.4 0 0 1 8.8 2.4z" />
    </svg>
  );
}
