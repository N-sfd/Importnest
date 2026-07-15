"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem("importnest-theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // ignore
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("importnest-theme", theme);
  } catch {
    // ignore
  }
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const next = readTheme();
    setTheme(next);
    applyTheme(next);
    setReady(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-xl px-2.5 py-1.5 transition hover:bg-white/10 sm:px-3 ${className}`}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
    >
      <span className="block text-[10px] font-medium uppercase tracking-wider text-white/55">
        Theme
      </span>
      <span className="font-semibold leading-tight">
        {!ready ? "Auto" : theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}

/** Inline script — prevents a light flash before the theme toggle hydrates. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("importnest-theme");if(t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;
