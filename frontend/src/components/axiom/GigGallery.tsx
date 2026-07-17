import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface GigGalleryProps {
  media: { type: "image" | "video"; url: string }[];
}

export function GigGallery({ media }: GigGalleryProps) {
  const [active, setActive] = useState(0);

  if (!media || media.length === 0) return (
    <div className="text-foreground text-sm p-1">No media Found!</div>
  );

  return (
    <div className="flex flex-col gap-2 w-full">

        {/* Main Display */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden ring-1 ring-muted-foreground bg-zinc-900">
        {media[active].type === "image" ? (
          <Image src={media[active].url} alt="" fill sizes="600px" className="object-cover" />
        ) : (
            // Inset-0 to make sure video conforms to aspect-video box
          <video src={media[active].url} controls className="absolut inset-0 w-full h-full object-cover" />
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
                <Image src={m.type === "image" ? m.url : m.url} alt="" fill sizes="64px" className="object-cover" />
            ) : (
                <video src={`${m.url}#t=0.1`} className="w-full h-full object-cover pointer-events-auto"></video>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}