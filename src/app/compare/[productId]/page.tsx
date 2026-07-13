import { Header } from "@/components/Header";
import { PriorityTabs } from "@/components/PriorityTabs";
import { canonicalProduct } from "@/lib/mock-data";

export default async function ComparePage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-md bg-navy-100" />
          <div>
            <h1 className="text-xl font-bold text-navy-900">{canonicalProduct.modelName}</h1>
            <p className="text-sm text-gray-500">
              Exact product match: 98% confidence · Last refreshed 4 minutes ago
            </p>
          </div>
        </div>

        <div className="mt-6">
          <PriorityTabs productId={productId} />
        </div>
      </section>
    </main>
  );
}
