import Image from "next/image";
import Link from "next/link";
import { BackendLinks } from "@/components/BackendLinks";
import { Header } from "@/components/Header";
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
  { n: 1, label: "Understand your need" },
  { n: 2, label: "Match comparable listings" },
  { n: 3, label: "Explain the best buying options" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-start gap-4">
          <Image
            src="/brand/logo.svg"
            alt=""
            width={56}
            height={56}
            className="mt-1 hidden rounded-xl sm:block"
            priority
          />
          <div>
            <h1 className="text-3xl font-bold text-navy-900">
              Shop smarter across trusted retailers
            </h1>
            <p className="mt-2 text-gray-600">
              Describe what you need, and Importnest will compare suitable offers.
            </p>
          </div>
        </div>

        <form
          action="/search"
          className="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center"
        >
          <label htmlFor="q" className="sr-only">
            What are you shopping for?
          </label>
          <input
            id="q"
            name="q"
            type="text"
            placeholder="What are you shopping for?"
            defaultValue="A quiet dishwasher under $900 with delivery this week"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-navy-800"
          />
          <button
            type="submit"
            className="rounded-md bg-navy-900 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Compare offers
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Importnest uses AI to interpret your request and only searches approved sources.
          Results may include estimates, clearly labeled.
        </p>

        <h2 className="mt-10 text-sm font-semibold text-gray-700">Popular categories</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="overflow-hidden rounded-lg border border-gray-200 transition hover:border-navy-800 hover:shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-navy-100">
                <Image src={c.image} alt="" fill className="object-cover" sizes="(max-width:640px) 50vw, 25vw" />
              </div>
              <div className="p-4">
                <div className="font-semibold text-navy-900">{c.name}</div>
                <div className="text-xs text-gray-500">{c.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="mt-10 text-sm font-semibold text-gray-700">How Importnest helps</h2>
        <div className="mt-3 flex flex-col gap-6 sm:flex-row">
          {steps.map((s) => (
            <div key={s.n} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white">
                {s.n}
              </span>
              <span className="text-sm text-gray-700">{s.label}</span>
            </div>
          ))}
        </div>

        <BackendLinks className="mt-10" />
      </section>
    </main>
  );
}
