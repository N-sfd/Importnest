"use client";

import { FormEvent, useEffect, useState } from "react";

const STORAGE_KEY = "importnest.deliveryLocation";
const DEFAULT_CITY = "Hagerstown";
const DEFAULT_ZIP = "21740";

type Location = { city: string; zip: string };

function loadLocation(): Location {
  if (typeof window === "undefined") {
    return { city: DEFAULT_CITY, zip: DEFAULT_ZIP };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { city: DEFAULT_CITY, zip: DEFAULT_ZIP };
    const parsed = JSON.parse(raw) as Partial<Location>;
    return {
      city: (parsed.city || DEFAULT_CITY).trim() || DEFAULT_CITY,
      zip: (parsed.zip || DEFAULT_ZIP).trim() || DEFAULT_ZIP,
    };
  } catch {
    return { city: DEFAULT_CITY, zip: DEFAULT_ZIP };
  }
}

/** Compact delivery location — structure only, no maps or Amazon branding. */
export function HeaderLocation() {
  const [location, setLocation] = useState<Location>({
    city: DEFAULT_CITY,
    zip: DEFAULT_ZIP,
  });
  const [editing, setEditing] = useState(false);
  const [cityDraft, setCityDraft] = useState(DEFAULT_CITY);
  const [zipDraft, setZipDraft] = useState(DEFAULT_ZIP);

  useEffect(() => {
    const next = loadLocation();
    setLocation(next);
    setCityDraft(next.city);
    setZipDraft(next.zip);
  }, []);

  function save(event: FormEvent) {
    event.preventDefault();
    const next = {
      city: cityDraft.trim() || DEFAULT_CITY,
      zip: zipDraft.trim() || DEFAULT_ZIP,
    };
    setLocation(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setEditing(false);
  }

  if (editing) {
    return (
      <form
        onSubmit={save}
        className="ml-1 flex min-w-0 max-w-[11rem] shrink-0 flex-col gap-1 sm:ml-2"
        aria-label="Update delivery location"
      >
        <input
          value={cityDraft}
          onChange={(e) => setCityDraft(e.target.value)}
          aria-label="City"
          className="w-full rounded-md border border-border bg-panel px-2 py-1 text-xs text-navy-900 outline-none placeholder:text-muted focus:ring-1 focus:ring-cta"
          placeholder="City"
        />
        <div className="flex gap-1">
          <input
            value={zipDraft}
            onChange={(e) => setZipDraft(e.target.value)}
            aria-label="ZIP code"
            className="w-full rounded-md border border-border bg-panel px-2 py-1 text-xs text-navy-900 outline-none placeholder:text-muted focus:ring-1 focus:ring-cta"
            placeholder="ZIP"
            maxLength={10}
          />
          <button
            type="submit"
            className="shrink-0 rounded-md bg-cta px-2 text-[11px] font-bold text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="shrink-0 rounded-md border border-border px-2 text-[11px] font-semibold text-muted hover:text-navy-900"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="ml-1 hidden min-w-0 max-w-[10.5rem] shrink-0 rounded-lg px-1.5 py-1 text-left transition hover:bg-navy-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta lg:ml-2 lg:block"
    >
      <span className="block truncate text-[11px] leading-tight text-muted">Delivering to</span>
      <span className="block truncate text-sm font-semibold leading-tight text-navy-900">
        {location.city} {location.zip}
      </span>
      <span className="block text-[11px] font-medium text-link">Update location</span>
    </button>
  );
}
