"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Check, RotateCcw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function GigFilterPopover() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(searchParams.get("rating") || "");
  const [deliveryTime, setDeliveryTime] = useState(
    searchParams.get("deliveryTime") || ""
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (minRating) params.set("rating", minRating);
    else params.delete("rating");

    if (deliveryTime) params.set("deliveryTime", deliveryTime);
    else params.delete("deliveryTime");

    // Reset pagination to page 1 on filter update
    params.delete("page");

    router.push(`/gigs?${params.toString()}`);
  };

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setDeliveryTime("");

    const params = new URLSearchParams(searchParams.toString());
    ["minPrice", "maxPrice", "rating", "deliveryTime", "page"].forEach((p) =>
      params.delete(p)
    );

    router.push(`/gigs?${params.toString()}`);
  };

  const activeFilterCount = [
    searchParams.get("minPrice"),
    searchParams.get("maxPrice"),
    searchParams.get("rating"),
    searchParams.get("deliveryTime"),
  ].filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 text-xs font-medium border border-border rounded-lg px-3 py-2 hover:bg-muted transition-colors relative">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-4 space-y-6" align="end">
        <div className="flex items-center justify-between border-b pb-3">
          <h4 className="font-semibold text-sm">Filter Services</h4>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* 1. Price Range */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">
            Budget Range ($)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full text-xs p-2 rounded-md border border-input bg-background"
            />
            <span className="text-muted-foreground text-xs">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full text-xs p-2 rounded-md border border-input bg-background"
            />
          </div>
        </div>

        {/* 2. Minimum Rating */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">
            Minimum Rating
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["4.5", "4.0", "3.5"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setMinRating(minRating === r ? "" : r)}
                className={`text-xs py-1.5 px-2 rounded-md border text-center transition-colors ${
                  minRating === r
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-input hover:bg-muted"
                }`}
              >
                ★ {r}+
              </button>
            ))}
          </div>
        </div>

        {/* 3. Delivery Time */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">
            Delivery Time
          </label>
          <div className="space-y-1.5">
            {[
              { label: "Express 24 hours", value: "1" },
              { label: "Up to 3 days", value: "3" },
              { label: "Up to 7 days", value: "7" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setDeliveryTime(
                    deliveryTime === option.value ? "" : option.value
                  )
                }
                className="w-full text-left text-xs p-2 rounded-md border border-input flex items-center justify-between hover:bg-muted"
              >
                <span>{option.label}</span>
                {deliveryTime === option.value && (
                  <Check className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Apply Action */}
        <button
          onClick={applyFilters}
          className="w-full text-xs font-medium bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          Apply Filters
        </button>
      </PopoverContent>
    </Popover>
  );
}