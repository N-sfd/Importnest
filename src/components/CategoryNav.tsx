"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CategoryNavIcon } from "@/components/CategoryNavIcons";
import {
  navDepartments,
  topNavLinks,
  utilityLinks,
  type NavDepartment,
} from "@/lib/nav-menu";

function DepartmentPanel({
  departments,
  activeId,
  onSelect,
}: {
  departments: NavDepartment[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const active = departments.find((d) => d.id === activeId) ?? departments[0];

  return (
    <div className="flex min-h-[280px] max-h-[min(70vh,520px)]">
      <ul className="w-[40%] max-w-[220px] shrink-0 overflow-y-auto border-r border-border bg-surface py-2">
        {departments.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onMouseEnter={() => onSelect(d.id)}
              onFocus={() => onSelect(d.id)}
              onClick={() => onSelect(d.id)}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold transition ${
                d.id === active.id
                  ? "bg-navy-900 text-white"
                  : "text-foreground hover:bg-navy-100"
              }`}
            >
              {d.name}
              <span aria-hidden className="text-xs opacity-60">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex-1 overflow-y-auto bg-panel p-4">
        <Link
          href={active.href}
          className="text-sm font-bold text-navy-900 hover:text-link hover:underline"
        >
          Shop all {active.name}
        </Link>
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {active.items.map((item) => (
            <li key={item.href + item.label}>
              <Link
                href={item.href}
                className="block rounded-lg px-2 py-2 text-sm text-foreground transition hover:bg-surface hover:text-link"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-border pt-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Quick links
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {utilityLinks.map((u) => (
              <li key={u.href + u.label}>
                <Link
                  href={u.href}
                  className="inline-flex rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-navy-800 hover:border-accent"
                >
                  {u.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function navLinkIsActive(
  href: string,
  pathname: string,
  category: string | null,
  q: string | null,
): boolean {
  if (!pathname.startsWith("/search")) return false;
  try {
    const url = new URL(href, "https://importnest.local");
    const linkCategory = url.searchParams.get("category");
    const linkQ = url.searchParams.get("q");
    if (linkQ === "deals") {
      return (q ?? "").toLowerCase().includes("deal");
    }
    if (linkCategory) {
      return category === linkCategory;
    }
  } catch {
    return false;
  }
  return false;
}

/** Amazon / Idealo-style department bar + All menu flyout. */
export function CategoryNav() {
  const [open, setOpen] = useState(false);
  const [activeDept, setActiveDept] = useState(navDepartments[0]?.id ?? "home");
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointer(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="category-nav relative border-b border-black/10 text-white">
      <div className="category-nav-inner nav-container">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="category-all"
        >
          <CategoryNavIcon label="All" />
          <span>All</span>
        </button>

        <nav
          aria-label="Departments"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {topNavLinks.map((link) => {
            const active = navLinkIsActive(link.href, pathname, category, q);
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`category-link ${link.featured ? "category-link-featured" : ""} ${
                  active ? "category-link-active" : ""
                }`}
              >
                <CategoryNavIcon label={link.label} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {open ? (
        <>
          <div
            aria-hidden
            className="fixed inset-0 top-[var(--header-offset,7.5rem)] z-30 bg-navy-900/40"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-label="All departments"
            className="absolute left-0 right-0 top-full z-40 border-b border-border shadow-[var(--shadow-panel)]"
          >
            <div className="mx-auto max-w-[1440px] overflow-hidden rounded-b-2xl border-x border-border bg-panel text-foreground sm:mx-4 lg:mx-auto">
              <DepartmentPanel
                departments={navDepartments}
                activeId={activeDept}
                onSelect={setActiveDept}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
