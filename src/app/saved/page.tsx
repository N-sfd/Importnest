import { Header } from "@/components/Header";
import { savedProducts } from "@/lib/mock-data";

const statusStyle: Record<string, string> = {
  watching: "bg-navy-100 text-navy-900",
  triggered: "bg-amber-100 text-amber-800",
  paused: "bg-gray-100 text-gray-500",
};

export default function SavedPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold text-navy-900">Saved products and alerts</h1>
        <p className="mt-1 text-sm text-gray-600">Track price, stock and delivery changes across approved sources.</p>

        <div className="mt-6 space-y-4">
          {savedProducts.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 shrink-0 rounded-md bg-navy-100" />
                <div>
                  <p className="font-semibold text-navy-900">{item.productName}</p>
                  <p className="text-sm text-gray-600">{item.currentValue}</p>
                  <p className="text-xs text-gray-400">Target: {item.target}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[item.status]}`}>
                  {item.status === "watching"
                    ? `Watching · ${item.sourceCoverage} sources`
                    : item.status === "triggered"
                    ? `Triggered · ${item.sourceCoverage} sources`
                    : "Paused"}
                </span>
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-navy-900 hover:border-navy-800">
                  View comparison
                </button>
              </div>
              <p className="text-xs text-gray-400 sm:ml-auto">Last checked {item.lastCheckedMinutesAgo} minutes ago</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
