function supabaseDashboardUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return "https://supabase.com/dashboard";
  try {
    const host = new URL(url).hostname;
    const projectRef = host.split(".")[0];
    if (projectRef) {
      return `https://supabase.com/dashboard/project/${projectRef}`;
    }
  } catch {
    // fall through
  }
  return "https://supabase.com/dashboard";
}

const links = [
  {
    name: "Prisma Studio",
    href: "http://localhost:5555",
    detail: "Browse Postgres tables — run npm run db:studio",
  },
  {
    name: "Supabase",
    href: supabaseDashboardUrl(),
    detail: "Project dashboard, Auth, and Table Editor",
  },
] as const;

export function BackendLinks({
  className = "",
  compact = false,
}: {
  className?: string;
  /** When true, omit the outer card chrome (e.g. nested under another panel). */
  compact?: boolean;
}) {
  if (process.env.NODE_ENV !== "development") return null;

  const list = (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {links.map((link) => (
        <li key={link.name}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col rounded-xl border border-border bg-panel px-3 py-2.5 transition hover:border-navy-800 hover:shadow-sm"
          >
            <span className="text-sm font-semibold text-foreground">{link.name}</span>
            <span className="mt-0.5 text-xs text-muted">{link.detail}</span>
          </a>
        </li>
      ))}
    </ul>
  );

  if (compact) {
    return (
      <div className={className}>
        <p className="text-xs font-semibold text-muted">Backend tools</p>
        {list}
      </div>
    );
  }

  return (
    <div className={`panel p-4 ${className}`}>
      <h2 className="text-sm font-semibold text-foreground">Backend tools</h2>
      <p className="mt-1 text-xs text-muted">
        Inspect the database and Supabase project while developing.
      </p>
      {list}
    </div>
  );
}
