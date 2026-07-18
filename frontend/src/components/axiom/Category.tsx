import Link from "next/link";
import { ReactNode } from "react";


interface Category {
  id: string;
  name: string;
  icon: ReactNode; // same "caller decides icon" pattern as PricingTierCard's theme.icon
  href: string;
}

interface CategoryGridProps {
  categories: Category[];
  variant: "inline" | "grid"
}

// Single card — kept separate from the grid so it can be reused
// elsewhere later (e.g. a "browse all categories" page) without
// needing the whole grid wrapper.
function CategoryCard({ name, icon, href }: Category) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted/40 transition">
      <div className="text-primary">{icon}</div>
      <span className="text-sm font-medium">{name}</span>
    </Link>
  );
}

export function CategoryGrid({ categories, variant }: CategoryGridProps) {

  if (variant === "inline") {
    return (
      <div className="flex justify-center w-full">
        <div className="flex  self-center overflow-x-auto p-3 w-[90vw] border rounded-md border-border">
          <div className="flex flex-row gap-3 min-w-max">
            {categories.map((c) => (
              <div key={c.id} className="shrink-0">
                <CategoryCard {...c}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {categories.map((c) => (
        <CategoryCard key={c.id} {...c} />
      ))}
    </div>
  );
}