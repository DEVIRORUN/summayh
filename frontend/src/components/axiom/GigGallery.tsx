"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MediaItem = 
  | string
  | { type: "image" | "video"; url: string };

interface GigGalleryProps {
  media: MediaItem[];
}

function normalizeMedia(item: MediaItem): { type: "image" | "video"; url: string } {
  if (typeof item === "object") return item;


    const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item);
    return {
      type: isVideo ? "video" : "image",
      url: item
    };
}

export function GigGallery({ media: rawMedia }: GigGalleryProps) {
  const [active, setActive] = useState(0);

  const media = rawMedia?.map(normalizeMedia) ?? [];

  if (media.length === 0) return (
    <div className="text-foreground text-sm p-1">No media Found!</div>
  );

  const current = media[active] || media[0];

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Main Display */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden ring-1 ring-muted-foreground bg-zinc-900">
        {current.type === "image" ? (
          <Image src={current.url} alt="" fill priority sizes="600px" className="object-cover" />
        ) : (
            // Inset-0 to make sure video conforms to aspect-video box
          <video src={current.url} controls className="absolut inset-0 w-full h-full object-cover" />
        )}
      </div>

      {/* Thumbnail Row */}
      {/* min-w-0 allows this horizontal flex container to shrink below its contents */}
      <div className="flex gap-2 overflow-x-auto min-w-0 w-full pb-1">
        {media.map((m, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
                "relative w-16 h-16 rounded-md overflow-hidden shrink-0 border-2", 
                active === i ? "border-primary" : "border-transparent")}
          >
            {m.type === "image" ? (
                <Image src={m.type === "image" ? m.url : m.url} alt="" priority fill sizes="64px" className="object-cover" />
            ) : (
                <video src={`${m.url}#t=0.1`} className="w-full h-full object-cover pointer-events-auto"></video>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}