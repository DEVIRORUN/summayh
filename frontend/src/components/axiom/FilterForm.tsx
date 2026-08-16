"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SlidersHorizontal } from "lucide-react"; // Or whatever icon library you use

export default function SearchLayout({
  budgetMax,
  location,
  searchInput,
  setSearchInput,
  handleSearchSubmit,
  isLoading,
  error,
  query,
  results,
}: any) {
  
  // Extracted to keep the code DRY between mobile and desktop views
  

  return (
    <div className="flex flex-col md:flex-row min-w-0 w-full">
      
      {/* Desktop Sidebar (Hidden on mobile) */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col gap-4 p-5 border-r border-border min-w-0 bg-card">
        <h2 className="text-sm font-bold text-foreground">Filters</h2>
        <FilterForm />
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
                <FilterForm isMobile />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0 pt-2">
          {results?.map((gig: any) => (
             {/* <GigCard key={gig.id} {...gig} /> */}
             <div key={gig.id} className="border border-border p-4 rounded-xs">Gig Card Mock</div>
          ))}
        </div>
        
      </main>
    </div>
  );
}