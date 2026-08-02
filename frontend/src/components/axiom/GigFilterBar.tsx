"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components//ui/button";
import { Separator } from "@/components//ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

export type GigSortOption = "recommened" | "recent" | "old" | "price_high_low" | "price_low_high";

interface FilterState {
    category?: string[];
    servicesTypes?: string[];
    servicesIncludes?: string[];
    sellerLevel?: string[];
    sellerType?: string[];
    sellerAvailability?: string[];
    sellerSpeaks?: string[];
    sellerLocation?: string[];
    minBudget?: string[];
    maxBudget?: string[];
    deliveryTime?: string;
    sortBy?: GigSortOption;
}

interface GigFilterBarProps {
    variant: "buyer" | "seller";
    onFilterChange?: (filters: FilterState) => void;
    initialFilters?: FilterState;
}

export function GigFilterBar({
    variant = "buyer",
    initialFilters,
    onFilterChange
}: GigFilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState<FilterState>(initialFilters || {})

    const isbuyer = variant === "buyer";
    const currentSort = filters.sortBy || "recommened";

    const handleCheckboxToggle = (categoryKey: keyof FilterState, value: string) => {
        setFilters((prev) => {
            const currentList = (prev[categoryKey] as string[]) || [];
            const updateList = currentList.includes(value)
                ? currentList.filter((item) => item !== value)
                : [...currentList, value]

            return { ...prev, [categoryKey]: updateList }
        })
    }

    const handleSortChange = (value: GigSortOption) => {
        setFilters((prev) => ({ ...prev, sortBy: value }));

        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", value);

        router.push(`?${params.toString()}`);

        onFilterChange?.({ ...filters, sortBy: value })
    }

    const handleSelectChange = (key: keyof FilterState, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    } // direct update

    const handleApply = () => {
        onFilterChange?.(filters);
    }

    const handleClearAll = () => {
        setFilters({});
        onFilterChange?.({});
    }


    return (
        <div className="flex flex-col gap-2 items-center justify-between w-full py-3">
            {isbuyer ? (
                <div className="flex items-center gap-2">
                    {}
                </div>
            ) : (
                <div className="text-sm font-semibold text-foreground">
                    Your Gig Overview
                </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground font-medium">Sort by</span>
                <select
                    value={currentSort}
                    onChange={(e) => handleSortChange?.(e.target.value as GigSortOption)}
                    className="cursor-pointer bg-background border rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                    <option className="cursor-pointer" value="recommended">Recommended</option>
                    <option  className="cursor-pointer" value="recent">Recent First</option>
                    <option  className="cursor-pointer" value="price_low_high">Price: Low to High</option>
                    <option  className="cursor-pointer" value="price_high_low">Price: High to Low</option>
                </select>
            </div>
        </div>
    )
}