"use client"; // 👈 This makes the wrapper a client component!

import { useState } from "react";
import { GigCard } from "../theorems/GigCard";


// 1. Destructure { url } from the props object here
interface GigsSectionProps {
  url: string;
  avatar: string
}

export function GigsSection({ url, avatar }: GigsSectionProps) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({
    "1": false, // default state
  })

  function handleFavorite(id: string) {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id]
    })) ;
    
    console.log(`Gig ${id} favorite status is now: ${!favorites[id]}`);
    // You can add your actual API call or state updates here!
  }
  return (
    <div className="flex gap-6 my-7.5">
      <GigCard
        id="1"
        title="I will create a professional 3D animated logo intro"
        thumbnail={url}
        price={15000}
        deliveryTime="3 days"
        rating={{ avgRating: 4.8, reviewCount: 120 }}
        seller={{ avatar, name: "John Adebayo", isOnline: true, level: "sentinel" }}
        tags={["modern logo", "logo", 'digital skill']}
        variant="list"
        isFavorited={!!favorites["1"]} 
        onFavorite={() => handleFavorite("1")}
      />
      {/* You can add more cards here easily! */}
    </div>
  );
}