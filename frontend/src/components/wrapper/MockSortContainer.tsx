// MockSortContainer.tsx
"use client";

import { useState } from "react";
import { SortDropdown } from "../axiom/SortOption";

// Match your custom component type declaration exactly
type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "newest";

export default function MockSortContainer() {
  // 1. Initialize state with a default active option value
  const [currentSort, setCurrentSort] = useState<SortOption>("relevance");

  const handleSortChange = (newSortValue: SortOption) => {
    setCurrentSort(newSortValue);
    
    // Track runtime changes cleanly inside your browser console
    console.log(`Grid sorting criteria updated to: ${newSortValue}`);
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-xl border shadow-sm w-fit">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Sort By:
      </span>
      
      {/* Your Dropdown component receiving the test state */}
      <SortDropdown 
        value={currentSort} 
        onChange={handleSortChange} 
      />
    </div>
  );
}
