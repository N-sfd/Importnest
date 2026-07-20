/**
 * Always-visible header search — wide pill, primary focus of the top bar.
 */
export function HeaderSearch() {
  return (
    <div className="header-search">
      <form action="/search" className="search-shell">
        <label htmlFor="header-q" className="sr-only">
          Search Importnest
        </label>
        <input
          id="header-q"
          name="q"
          type="search"
          placeholder="Search products, models, or UPCs"
          className="search-input"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn-cta m-1.5 h-9 min-w-[5.25rem] shrink-0 px-5 text-sm leading-none sm:h-10 sm:min-w-[5.75rem] sm:px-6"
        >
          Search
        </button>
      </form>
    </div>
  );
}
