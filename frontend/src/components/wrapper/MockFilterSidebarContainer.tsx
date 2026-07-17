// MockFilterSidebarContainer.tsx
"use client";

import { useState } from "react";
import { FilterSidebar } from "../axiom/FilterSIidebar"; 

// Re-exporting types for external type safety validation if needed
export interface FilterConfig {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "slider";
  options?: { label: string; value: string }[];
  range?: [number, number];
}

// 1. Exportable Static Configuration Data
export const mockFilterConfigs: FilterConfig[] = [
  {
    id: "delivery-time",
    label: "Delivery Time",
    type: "radio",
    options: [
      { label: "Express (24 hours)", value: "1_day" },
      { label: "Up to 3 days", value: "3_days" },
      { label: "Up to 7 days", value: "7_days" },
      { label: "Anytime", value: "any" },
    ],
  },
  {
    id: "seller-level",
    label: "Seller Level",
    type: "checkbox",
    options: [
      { label: "Top Rated Seller", value: "top_rated" },
      { label: "Level 2 Seller", value: "level_two" },
      { label: "Level 1 Seller", value: "level_one" },
      { label: "New Seller", value: "new_seller" },
    ],
  },
  {
    id: "price-range",
    label: "Budget Range ($)",
    type: "slider",
    range: [500, 1500],
  },
];

// 2. Main Stateful Testing Wrapper Component
export default function MockFilterSidebarContainer() {
  // Define initial structural values for your filters
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    "delivery-time": "any",
    "seller-level": ["top_rated"],
    "price-range": [5000, 45000],
  });

  const handleFilterChange = (filterId: string, newValue: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterId]: newValue,
    }));
    
    // Track runtime changes cleanly inside the browser console
    console.log(`Updated filter [${filterId}]:`, newValue);
  };

  return (
    <div className="w-full max-w-xs p-5 bg-card rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Filter Gigs</h3>
        <button 
          onClick={() => setFilterValues({ "delivery-time": "any", "seller-level": [], "price-range": [5, 1000] })}
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
        >
          Clear All
        </button>
      </div>

      <FilterSidebar 
        filters={mockFilterConfigs} 
        values={filterValues} 
        onChange={handleFilterChange} 
      />
    </div>
  );
}
