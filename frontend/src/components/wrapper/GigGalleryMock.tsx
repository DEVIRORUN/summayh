"use client";

import { GigGallery } from "@/components/axiom/GigGallery";

// 1. Defining the data structure for the gallery items
interface GigGalleryProps {
  media: { type: "image" | "video"; url: string }[];
}

 // 3. Demo Page with Mock Data
export default function GalleryDemoPage() {
  // Mock array containing real, public placeholder images and videos
  const mockData: GigGalleryProps["media"] = [
    {
      type: "image",
      url: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/logo-test.jpg",
    },
    {
      type: "image",
      url: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-1.jpg",
    },
    {
      type: "image",
      url: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-2.jpg",
    },
    {
      type: "image",
      url: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-3.jpeg",
    },
    {
      type: "image",
      url: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-3.jpeg",
    },
    {
      type: "video",
      url: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/0205%20(2)-2.mp4GOAL%201.mp4",
    },
    {
      type: "image",
      url: "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/gig-3.jpeg",
    },
  ];

  return (
    <aside className="w-80 border-r p-4 bg-background rounded-lg"> {/* Parent sets strict width */}
        <h2 className="text-lg font-bold mb-4">Gig Media</h2>
        <GigGallery media={mockData} /> 
    </aside>
  );
}
