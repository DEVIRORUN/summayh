"use client";

import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/axiom/HeroSection";


export function HeroWrapper() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (!query || !query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query)}`);
  };


    return (
        <HeroSection onSearch={handleSearch}/>
    )
}