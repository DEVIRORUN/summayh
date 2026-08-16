"use client";

import { GigCard, type GigCardProps } from "@/components/theorems/GigCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter, useSearchParams } from "next/navigation"; // Fixed import
import React, { useEffect, useState } from "react";

interface RawGigResult {
  id: string;
  title: string;
  decsription: string;
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

    // the loop
    formData.forEach((value, key) => {
      const valStr = value.toString().trim();
      if (valStr) {
        params.set(key, valStr);
      } else {
        params.delete(key);
      }
    });

    if (searchInput.trim()) {
      params.set("q", searchInput.trim())
    } else {
      params.delete("q")
    }

    router.push(`/search?${params.toString()}`);
  };

  useEffect(() => {
    if (!query || !category) return;
    if (query || query.trim().length < 3 && !category) return;

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
            data.message || `Search failed with status ${res.status}`,
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

    fetchGigs(); // Execute it
  }, [query, category, budgetMax, location]);

  return (
    <div className="flex flex-row min-w-0">
      {/* Sidebar Filters */}
      <form
        id="search-filter-form"
        onSubmit={handleSearchSubmit}
        className="w-[240px] shrink-0 flex flex-col gap-4 p-4 border-r border-border min-w-0"
      >
        <div>
          <label className="text-xs font-semibold">Max Budget (₦)</label>
          <Input
            type="number"
            name="budgetMax"
            defaultValue={budgetMax}
            placeholder="Any"
            className="rounded-xs text-xs mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Location</label>
          <Input
            name="location"
            defaultValue={location}
            placeholder="e.g. LAUTECH, Ogbomosho"
            className="rounded-xs text-xs mt-1"
          />
        </div>
      </form>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4">
        <div className="flex gap-2 mb-4">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for a service..."
            className="rounded-xs text-xs"
          />
          <Button type="submit" form="search-filter-form" className="bg-foreground hover:bg-muted-foreground cursor-pointer rounded-xs">
            Search
          </Button>
        </div>

        {isLoading && (
          <p className="text-xs text-muted-foreground animate-pulse">Searching...</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
        {!isLoading && !error && query && results.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {`No results found for "${query}"`}.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-w-0">
          {results.map((gig) => (
            <GigCard key={gig.id} {...gig} />
          ))}
        </div>
      </main>
    </div>
  );
}
