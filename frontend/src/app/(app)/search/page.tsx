"use client";

import { GigCard, type GigCardProps } from "@/components/theorems/GigCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// ----------------------------------------------------------------------
// 1. Types & Interfaces
// ----------------------------------------------------------------------
interface RawGigResult {
  id: string;
  title: string;
  description: string; // Fixed typo here
  tags: string[];
  gigType: string;
  avgRating: number;
  totalReviews: number;
  coverImage: string;
  sellerUsername: string;
  sellerRating: number;
  isPro: boolean;
  avatar: string;
  startingPrice: number;
  relevance: number;
}

interface FilterFormProps {
  isMobile?: boolean;
  handleSearchSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  budgetMax: string;
  location: string;
}

function mapToGigCardProps(raw: RawGigResult): GigCardProps {
  return {
    id: raw.id,
    title: raw.title,
    thumbnail: raw.coverImage,
    price: raw.startingPrice,
    tags: raw.tags,
    deliveryTime: "-",
    rating: { avgRating: raw.avgRating, reviewCount: raw.totalReviews },
    seller: {
      avatar: raw.avatar,
      name: raw.sellerUsername,
      isOnline: false,
      level: undefined,
    },
  };
}

// ----------------------------------------------------------------------
// 2. Extracted Filter Component
// ----------------------------------------------------------------------
function FilterForm({ isMobile = false, handleSearchSubmit, budgetMax, location }: FilterFormProps) {
  return (
    <form
      id={isMobile ? "mobile-search-filter-form" : "search-filter-form"}
      onSubmit={handleSearchSubmit}
      className="flex flex-col gap-5 min-w-0"
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Max Budget (₦)</label>
        <Input
          type="number"
          name="budgetMax"
          defaultValue={budgetMax}
          placeholder="Any"
          className="rounded-xs text-xs bg-background"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-foreground">Location</label>
        <Input
          name="location"
          defaultValue={location}
          placeholder="e.g. LAUTECH, Ogbomosho"
          className="rounded-xs text-xs bg-background"
        />
      </div>
      
      {isMobile && (
        <Button type="submit" className="w-full mt-4 rounded-xs text-xs font-medium cursor-pointer">
          Apply Filters
        </Button>
      )}
    </form>
  );
}

// ----------------------------------------------------------------------
// 3. Main Page Component
// ----------------------------------------------------------------------
export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const budgetMax = searchParams.get("budgetMax") ?? "";
  const location = searchParams.get("location") ?? "";
  const category = searchParams.get("category") ?? "";

  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<GigCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams(searchParams.toString());

    formData.forEach((value, key) => {
      const valStr = value.toString().trim();
      if (valStr) {
        params.set(key, valStr);
      } else {
        params.delete(key);
      }
    });

    if (searchInput.trim()) {
      params.set("q", searchInput.trim());
    } else {
      params.delete("q");
    }

    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (!query || !category) return;
    if ((query || query.trim().length < 3) && !category) return;

    const fetchGigs = async () => {
      setError(null);
      setIsLoading(true);

      try {
        const res = await fetch("/api/gig/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: query || undefined,
            category: category || undefined,
            budgetMax: budgetMax ? Number(budgetMax) : undefined,
            location: location || undefined,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          const data = text ? JSON.parse(text) : {};
          throw new Error(
            data.message || `Search failed with status ${res.status}`
          );
        }

        const data = await res.json();
        setResults(data.results ? data.results.map(mapToGigCardProps) : []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigs();
  }, [query, category, budgetMax, location]);

  return (
    <div className="flex flex-col md:flex-row min-w-0 w-full">
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col gap-4 p-5 border-r border-border min-w-0 bg-card min-h-screen">
        <h2 className="text-sm font-bold text-foreground">Filters</h2>
        {/* Passed props safely to the desktop form */}
        <FilterForm 
          handleSearchSubmit={handleSearchSubmit}
          budgetMax={budgetMax}
          location={location}
        />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-4">
        {/* Search Bar & Mobile Trigger Row */}
        <div className="flex items-center gap-2 w-full">
          {/* Mobile Filter Trigger */}
          <div className="md:hidden shrink-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="rounded-xs px-3 border-border cursor-pointer bg-card">
                  <SlidersHorizontal className="h-4 w-4 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-5 sm:w-[320px]">
                <SheetHeader className="mb-6 text-left">
                  <SheetTitle className="text-sm font-bold text-foreground">Filters</SheetTitle>
                </SheetHeader>
                {/* Passed props safely to the mobile form */}
                <FilterForm 
                  isMobile 
                  handleSearchSubmit={handleSearchSubmit}
                  budgetMax={budgetMax}
                  location={location}
                />
              </SheetContent>
            </Sheet>
          </div>

          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a service..."
            className="rounded-xs text-xs bg-card"
          />
          <Button
            type="submit"
            form="search-filter-form"
            className="bg-foreground hover:bg-muted-foreground cursor-pointer rounded-xs text-xs font-medium px-5 shrink-0"
          >
            Search
          </Button>
        </div>

        {/* State Messages */}
        {isLoading && (
          <p className="text-xs text-muted-foreground font-medium animate-pulse">Searching...</p>
        )}
        {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        {!isLoading && !error && query && results.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No results found for <span className="font-semibold text-foreground">"{query}"</span>.
          </p>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-w-0 pt-2">
          {results.map((gig) => (
            <GigCard key={gig.id} {...gig} />
          ))}
        </div>
      </main>
    </div>
  );
}