"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function GigFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [deliveryTime, setDeliveryTime] = useState(searchParams.get("deliveryTime") || "");
  const sortBy = searchParams.get("sortBy") || "newest";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page"); // reset pagination on filter change
    router.push(`${pathname}?${params.toString()}`);
  }

  function applyFilters() {
    updateParams({ minPrice, maxPrice, rating, deliveryTime });
    setOpen(false);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setDeliveryTime("");
    updateParams({ minPrice: null, maxPrice: null, rating: null, deliveryTime: null });
    setOpen(false);
  }

  const activeCount = [minPrice, maxPrice, rating, deliveryTime].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3">
      <select
        value={sortBy}
        onChange={(e) => updateParams({ sortBy: e.target.value })}
        className="text-xs font-medium border border-border rounded-lg px-3 py-2 bg-background hover:bg-muted transition-colors"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-medium border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
              {activeCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-4 z-20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Filters</h4>
              <button onClick={() => setOpen(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Price Range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background"
                />
                <span className="text-muted-foreground text-xs">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Minimum Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background"
              >
                <option value="">Any</option>
                <option value="4.5">4.5+</option>
                <option value="4">4+</option>
                <option value="3">3+</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Delivery Time
              </label>
              <select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full text-xs border border-border rounded-md px-2 py-1.5 bg-background"
              >
                <option value="">Any</option>
                <option value="1">Up to 1 day</option>
                <option value="3">Up to 3 days</option>
                <option value="7">Up to 7 days</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={applyFilters}
                className="flex-1 text-xs font-medium bg-primary text-primary-foreground rounded-md py-2 hover:opacity-90"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 text-xs font-medium border border-border rounded-md py-2 hover:bg-muted"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}