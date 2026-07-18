import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onSearch: (query: string) => void; // bubbles the search term up to the page, which then navigates to /search?q=...
}

export function HeroSection({ onSearch }: HeroSectionProps) {
    const [query, setQuery] = useState("");
    // const [mounted, setMounted] = useState(false);

    // useEffect(() => {
    //     setMounted(true);
    // }, []);

    const executeSearch = () => {
        // Guard clause: stop if query is empty or shorter than 3 characters
        if (!query || query.trim().length < 3) return;

        onSearch(query.trim());
    };


    return (
        <div className="flex flex-col items-center text-center gap-6 py-16 px-4">
        <h1 className="text-3xl md:text-5xl font-bold max-w-2xl">
            Find the right freelancer for your project
        </h1>
        <p className="text-muted-foreground max-w-lg">
            Connect with skilled Nigerian students and freelancers, ready to deliver.
        </p>

        {/* Reusing plain Input + Button here rather than the full SearchBar component —
            SearchBar has autocomplete/suggestions logic which isn't needed on the
            homepage hero, just a simple "type and hit go" that redirects to /search */}
        <div className="flex w-full max-w-md gap-2">
            <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && executeSearch()}
            placeholder="Try 'logo design' or 'video editing'"
            />
            <Button 
                onClick={() => (executeSearch())} 
                disabled={query.trim().length < 3}
                suppressHydrationWarning    
            >Search</Button>
        </div>
        </div>
    );
}