import Link from "next/link";
import { Header } from "@/components/Header";

const questions = [
  { label: "Primary use", options: ["Study and everyday work", "Programming", "Design"] },
  { label: "Condition", options: ["New only", "Open-box is fine", "Certified refurbished"] },
  { label: "Delivery", options: ["Before Friday", "This weekend", "No rush"] },
];

export default function ClarifyPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-navy-900">Refine your request</h1>
        <p className="mt-1 text-sm text-gray-600">A few focused questions improve product and offer matching.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-lg border border-gray-200 p-5 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Your request</p>
            <p className="mt-1 text-lg font-semibold text-navy-900">
              A lightweight laptop for university, under $1,000, needed before Friday.
            </p>

            <div className="mt-6 space-y-6">
              {questions.map((q) => (
                <div key={q.label}>
                  <p className="text-sm font-semibold text-gray-700">{q.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {q.options.map((opt, i) => (
                      <button
                        key={opt}
                        type="button"
                        className={`rounded-md border px-3 py-2 text-sm ${
                          i === 0
                            ? "border-navy-800 bg-navy-100 font-medium text-navy-900"
                            : "border-gray-300 text-gray-600 hover:border-navy-800"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-gray-200 p-5">
            <p className="text-sm font-semibold text-navy-900">Current preferences</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>✓ Budget: up to $1,000</li>
              <li>✓ Use: study and work</li>
              <li>✓ Condition: new</li>
              <li>✓ Delivery: before Friday</li>
            </ul>
            <Link
              href="/compare/cp-apex-ah4200"
              className="mt-6 block rounded-md bg-navy-900 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-navy-800"
            >
              Show comparisons
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
