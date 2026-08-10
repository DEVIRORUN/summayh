"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "@/components/axiom/SearchBar"; // adjustments based on your folder structure

// Mock Database of suggestions based on your freelance niche
const ALL_MOCK_SUGGESTIONS = [
  "Logo Design",
  "Video Editing",
  "Website Development",
  "WordPress Setup",
  "UI/UX Design",
  "Copywriting",
  "Social Media Marketing",
  "Graphics Design"
];

export function SearchManager() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  // Automatically filters suggestions on the fly as the user types
  useEffect(() => {
    if (!searchValue.trim()) {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = ALL_MOCK_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(searchValue.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [searchValue]);

  // Executes the final page routing redirect
  const handleSearchSubmit = () => {
    if (!searchValue.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <div className="w-[70%] my-5 flex items-center">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          onSubmit={handleSearchSubmit}
          suggestions={filteredSuggestions}
          quickTags={["Website Development", "Video Editing", "UI/UX Design", "TikTok Shop"]}
          placeholder="Search freelance services..."
          variant="hero"
        />
    </div>
  );
}
