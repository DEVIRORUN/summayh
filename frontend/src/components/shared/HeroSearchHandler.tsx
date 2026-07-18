"use client";

import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/axiom/HeroSection";
// import HeroSection


export function HeroSearchHandler() {
    const router = useRouter();

    function handleSearch(query: string) {
        router.push(`/search?q=${encodeURIComponent(query)}`);  //Changes the browser's URL without reloading the page and URIComponent converts into safe stuff browser can use
    }

    return<HeroSection onSearch={handleSearch} />
}