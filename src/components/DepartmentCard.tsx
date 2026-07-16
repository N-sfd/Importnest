import { CategoryImageCard, type CategoryImageCardProps } from "@/components/CategoryImageCard";

export type DepartmentCardData = CategoryImageCardProps;

/** @deprecated Prefer CategoryImageCard — kept for call-site compatibility. */
export function DepartmentCard({ category }: { category: DepartmentCardData }) {
  return <CategoryImageCard {...category} />;
}

export function DepartmentGrid({ categories }: { categories: DepartmentCardData[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
      {categories.map((c) => (
        <CategoryImageCard key={c.name} {...c} />
      ))}
    </div>
  );
}
