import Link from "next/link";
import type { ReactNode } from "react";

type Tone = "neutral" | "warn" | "info" | "accent";

const toneClass: Record<Tone, string> = {
  neutral: "border-border bg-panel",
  warn: "border-amber-300 bg-amber-50",
  info: "border-border bg-surface",
  accent: "border-accent/40 bg-accent/10",
};

const tonePrefix: Record<Tone, string> = {
  neutral: "",
  warn: "Warning: ",
  info: "",
  accent: "",
};

export function StatusPanel({
  title,
  description,
  tone = "neutral",
  children,
  actions,
}: {
  title: string;
  description?: string;
  tone?: Tone;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border px-5 py-8 text-center sm:px-8 ${toneClass[tone]}`}
      role="status"
      aria-live="polite"
    >
      <h2 className="text-xl font-extrabold tracking-tight text-navy-900 sm:text-2xl">
        <span className="sr-only">{tonePrefix[tone]}</span>
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {children}
      {actions ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3">{actions}</div>
      ) : null}
    </section>
  );
}

export function StatusBanner({
  title,
  description,
  tone = "info",
  action,
}: {
  title: string;
  description?: string;
  tone?: Tone;
  action?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${toneClass[tone]}`}
      role="status"
      aria-live="polite"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-navy-900">
          <span className="sr-only">{tonePrefix[tone]}</span>
          {title}
        </p>
        {description ? <p className="mt-0.5 text-xs text-muted sm:text-sm">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PrimaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="btn-cta px-4 py-2.5 text-sm">
      {children}
    </Link>
  );
}

export function SecondaryAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border bg-panel px-4 py-2.5 text-sm font-semibold text-navy-900 hover:border-navy-800"
    >
      {children}
    </Link>
  );
}
