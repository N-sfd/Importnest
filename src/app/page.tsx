import Image from "next/image";
import Link from "next/link";
import { BackendLinks } from "@/components/BackendLinks";
import { BrandMark } from "@/components/BrandMark";
import { PageShell } from "@/components/PageShell";
import { categoryImages } from "@/lib/images";

const categories = [
  {
    name: "Electronics",
    desc: "Phones, audio, computers",
    href: "/search?category=electronics",
    image: categoryImages.electronics,
  },
  {
    name: "Appliances",
    desc: "Kitchen and laundry",
    href: "/search?category=appliances",
    image: categoryImages.appliances,
  },
  {
    name: "Footwear",
    desc: "New and resale options",
    href: "/search?category=footwear",
    image: categoryImages.footwear,
  },
  {
    name: "Home",
    desc: "Furniture and smart home",
    href: "/search?category=home",
    image: categoryImages.home,
  },
];

const steps = [
  { n: "01", label: "Describe what you need", detail: "Natural language, model, or UPC" },
  { n: "02", label: "Match approved listings", detail: "Only trusted source connectors" },
  { n: "03", label: "Compare with clarity", detail: "Total cost, delivery, protection" },
];

export default function HomePage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden rounded-2xl border border-border bg-navy-900 px-5 py-8 text-white shadow-[var(--shadow-panel)] sm:px-8 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-ring/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cta/15 blur-3xl"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <BrandMark size="lg" showWordmark onDark />
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Compare trusted offers in one clear view
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/75 sm:text-base">
              Search once. See total known cost, delivery, and protection—sourced only from
              approved retailers.
            </p>
          </div>
        </div>

        <form
          action="/search"
          className="relative mt-7 flex overflow-hidden rounded-full bg-white shadow-lg focus-within:ring-2 focus-within:ring-ring"
        >
          <label htmlFor="home-q" className="sr-only">
            What are you shopping for?
          </label>
          <input
            id="home-q"
            name="q"
            type="search"
            placeholder="Try: quiet dishwasher under $900"
            defaultValue="A quiet dishwasher under $900 with delivery this week"
            className="min-w-0 flex-1 px-5 py-3.5 text-sm text-foreground outline-none placeholder:text-muted"
          />
          <button type="submit" className="btn-cta m-1.5 shrink-0 px-6 text-sm">
            Search
          </button>
        </form>
        <p className="relative mt-3 text-xs text-white/55">
          Estimates are labeled. Sponsored placements never change organic ranking.
        </p>
      </section>

      <div className="mt-8 flex items-end justify-between gap-3">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Shop by department</h2>
        <Link href="/search?category=appliances" className="text-sm font-semibold text-link hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {categories.map((c) => (
          <Link
            key={c.name}
            href={c.href}
            className="group overflow-hidden rounded-2xl border border-border bg-panel shadow-[var(--shadow-panel)] transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] bg-navy-100">
              <Image
                src={c.image}
                alt=""
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width:640px) 50vw, 25vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/80 via-navy-950/30 to-transparent px-3.5 py-3.5">
                <div className="font-bold text-white">{c.name}</div>
                <div className="text-xs text-white/80">{c.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section className="panel mt-8 p-6 sm:p-7">
        <h2 className="text-xl font-bold tracking-tight text-foreground">How it works</h2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-border bg-surface/80 px-4 py-4"
            >
              <span className="text-xs font-bold tracking-[0.16em] text-accent">{s.n}</span>
              <p className="mt-2 font-semibold text-foreground">{s.label}</p>
              <p className="mt-1 text-sm text-muted">{s.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <BackendLinks className="mt-6" />
    </PageShell>
  );
}
