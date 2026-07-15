"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/** Reveal header search after the homepage hero scrolls mostly out of view. */
const HOME_SCROLL_REVEAL_PX = 220;

export function HeaderSearch() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [revealed, setRevealed] = useState(!isHome);

  useEffect(() => {
    if (!isHome) {
      setRevealed(true);
      return;
    }

    const update = () => {
      setRevealed(window.scrollY >= HOME_SCROLL_REVEAL_PX);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome]);

  return (
    <div
      className={`overflow-hidden transition-[opacity,transform] duration-300 ease-out ${
        revealed
          ? "order-3 w-full min-w-0 translate-y-0 opacity-100 sm:order-none sm:w-auto sm:flex-1"
          : "pointer-events-none w-0 max-w-0 shrink -translate-y-1 opacity-0"
      }`}
      aria-hidden={!revealed}
    >
      <form
        action="/search"
        className="flex w-full items-center overflow-hidden rounded-full bg-white focus-within:ring-2 focus-within:ring-ring"
      >
        <label htmlFor="header-q" className="sr-only">
          Search Importnest
        </label>
        <input
          id="header-q"
          name="q"
          type="search"
          placeholder="Search products, models, or UPCs"
          tabIndex={revealed ? 0 : -1}
          className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted sm:px-4"
        />
        <button
          type="submit"
          tabIndex={revealed ? 0 : -1}
          className="btn-cta m-1 h-9 min-w-[4.5rem] shrink-0 px-3.5 text-sm leading-none sm:min-w-[4.75rem] sm:px-4"
        >
          Search
        </button>
      </form>
    </div>
  );
}
