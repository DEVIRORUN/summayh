"use client";

import { RelatedGigsCarousel } from "@/components/theorems/RelatedGigCarousel";

export default function MockCarouselContainer() {
  const mockGigs = [
    {
      id: "gig-1",
      title: "I will design a modern minimalist 3D animated business logo",
      thumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/logo-test.jpg",
      price: 15000,
      deliveryTime: "3 days",
      rating: { avgRating: 4.9, reviewCount: 88 },
      seller: { avatar: "https://pravatar.cc", sellerUsername: "David A.", isOnline: true },
      tags: ["modern logo", "logo"],
      isFavorited: false,
      state: "ACTIVE" as const, // Fixed: Using proper union type
    },
    {
      id: "gig-2",
      title: "I will write high conversion SEO optimized website copy",
      thumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-1.jpg",
      price: 8500,
      deliveryTime: "2 days",
      rating: { avgRating: 4.7, reviewCount: 41 },
      seller: { avatar: "https://pravatar.cc", sellerUsername: "Sarah K.", isOnline: false },
      tags: ["copywriting"],
      isFavorited: true,
      state: "ACTIVE" as const,
    },
    {
      id: "gig-3",
      title: "I will develop a responsive Next.js dashboard template layout",
      thumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-2.jpg",
      price: 45000,
      deliveryTime: "5 days",
      rating: { avgRating: 5.0, reviewCount: 19 },
      seller: { avatar: "https://pravatar.cc", sellerUsername: "Alex R.", isOnline: true },
      tags: ["nextjs", "web skill"],
      isFavorited: false,
      state: "ACTIVE" as const,
    },
    {
      id: "gig-4",
      title: "I will setup secure database servers with Prisma and PostgreSQL",
      thumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-3.jpeg",
      price: 32000,
      deliveryTime: "4 days",
      rating: { avgRating: 4.8, reviewCount: 104 },
      seller: { avatar: "https://pravatar.cc", sellerUsername: "John M.", isOnline: true },
      tags: ["database"],
      isFavorited: false,
      state: "ACTIVE" as const,
    },
    {
      id: "gig-5",
      title: "I will design custom social media content marketing kits",
      thumbnail: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-3.jpeg", 
      price: 6000,
      deliveryTime: "1 day",
      rating: { avgRating: 4.6, reviewCount: 12 },
      seller: { avatar: "https://pravatar.cc", sellerUsername: "Elena V.", isOnline: false },
      tags: ["marketing"],
      isFavorited: false,
      state: "ACTIVE" as const,
    },
  ];

  return (
    <div className="w-full max-w-[75%] py-5 bg-background mx-auto px-6 rounded-lg overflow-hidden border shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight">People Also Viewed</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Explore related digital skills matching your search.</p>
      </div>

      <div className="w-full overflow-hidden"> 
        <RelatedGigsCarousel gigs={mockGigs} />
      </div>
    </div>
  );
}