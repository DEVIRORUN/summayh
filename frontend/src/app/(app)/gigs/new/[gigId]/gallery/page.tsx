"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X, Loader2, ImagePlus, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 3;

export default function GalleryGigPage() {
  const router = useRouter();
  const { gigId } = useParams();

  const [images, setImages] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File, slot: "image" | "video") {
    // 1. ask backend for a presigned R2 url
    const res = await fetch(`/api/gig/${gigId}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileType: file.type, slot }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to get upload URL.");
    }

    const { data } = await res.json();
    const { uploadUrl, publicUrl } = data;

    // 2. PUT the raw file straight to R2
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putRes.ok) throw new Error("Upload to storage failed.");

    return publicUrl as string;
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file later
    if (!file || images.length >= MAX_IMAGES) return;

    setError(null);
    setUploadingImage(true);
    try {
      const publicUrl = await uploadFile(file, "image");
      setImages((prev) => [...prev, publicUrl]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setUploadingVideo(true);
    try {
      const publicUrl = await uploadFile(file, "video");
      setVideo(publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit() {
    setError(null);
    if (images.length < 1) return setError("At least one image is required.");

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gig/${gigId}/gallery`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images, video }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save gallery.");
      }

      router.push(`/gigs/new/${gigId}/publish`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const imageSlots = Math.min(images.length + 1, MAX_IMAGES);

  return (
    <div className="flex flex-col gap-4 text-muted-foreground min-w-0">
      <span className="text-2xl font-semibold">Gallery</span>
      <span className="border-b-1 border-border" />

      {/* IMAGES */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm text-foreground">Images</span>
        <p className="text-xs text-muted-foreground">
          Upload up to {MAX_IMAGES} images. The first one becomes your cover image.
        </p>
        <div className="flex flex-row gap-3 flex-wrap">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative w-28 h-28 rounded-xs border border-border overflow-hidden shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 cursor-pointer"
              >
                <X className="h-3 w-3" strokeWidth={3} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-foreground text-background px-1 rounded-xs">
                  Cover
                </span>
              )}
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <label
              className={cn(
                "w-28 h-28 rounded-xs border-2 border-dashed border-border flex items-center justify-center shrink-0 cursor-pointer hover:border-muted-foreground transition-colors",
                uploadingImage && "pointer-events-none opacity-60"
              )}
            >
              {uploadingImage ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ImagePlus className="h-5 w-5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={uploadingImage}
              />
            </label>
          )}
        </div>
      </div>



      {/* VIDEO */}
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-sm text-foreground">Video (optional)</span>
        <p className="text-xs text-muted-foreground">One short demo clip, max ~50MB.</p>

        {video ? (
          <div className="relative w-40 h-28 rounded-xs border border-border overflow-hidden">
            <video src={video} className="w-full h-full object-cover" controls />
            <button
              type="button"
              onClick={() => setVideo(null)}
              className="absolute top-1 right-1 bg-background/80 rounded-full p-0.5 cursor-pointer"
            >
              <X className="h-3 w-3" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <label
            className={cn(
              "w-40 h-28 rounded-xs border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors",
              uploadingVideo && "pointer-events-none opacity-60"
            )}
          >
            {uploadingVideo ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Film className="h-5 w-5" />
            )}
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleVideoSelect}
              disabled={uploadingVideo}
            />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || uploadingImage || uploadingVideo}
          className={cn(
            "bg-muted-foreground hover:bg-foreground rounded-md cursor-pointer",
            isSubmitting && "animate-pulse"
          )}
        >
          {isSubmitting ? "Saving..." : "Save & Continue"}
        </Button>
      </div>
    </div>
  );
}