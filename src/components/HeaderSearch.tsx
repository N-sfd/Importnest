"use client";

/**
 * Always-visible header search. Large and centered in the header row.
 */
export function HeaderSearch() {
  return (
    <div className="order-3 w-full min-w-0 sm:order-none sm:mx-1 sm:flex-1 lg:mx-2">
      <form
        action="/search"
        className="flex w-full items-center overflow-hidden rounded-full border border-border bg-panel shadow-[0_1px_3px_rgb(4_25_53/0.08)] focus-within:border-cta/40 focus-within:ring-2 focus-within:ring-ring"
      >
        <label htmlFor="header-q" className="sr-only">
          Search Importnest
        </label>
        <input
          id="header-q"
          name="q"
          type="search"
          placeholder="Search products, models, or UPCs"
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 text-sm text-navy-900 outline-none placeholder:text-muted sm:px-5 sm:text-[15px]"
        />
        <button
          type="submit"
          className="btn-cta m-1.5 h-10 min-w-[5rem] shrink-0 px-4 text-sm leading-none sm:min-w-[5.5rem] sm:px-5"
        >
          Search
        </button>
      </form>
    </div>
  );
}
