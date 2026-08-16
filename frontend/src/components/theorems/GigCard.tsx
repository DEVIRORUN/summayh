"use client"

import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriceTag } from "@/components/axiom/PriceTag";
import { RatingInline } from "@/components/axiom/RatingInline";
import { SellerMiniRow, type SellerLevel } from "@/components/axiom/SellerMiniRow";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface GigTier {
  id?: string;
  name?: string;
  price?: number | string;
  deliveryDays?: number;
  key: string;
}

export interface GigCardProps{
    id: string;
    title: string;
    thumbnail?: string;
    coverImage?: string;
    images?: string[];
    tiers?: GigTier[] | string[]
    price: number
    deliveryTime: string;
    rating: { avgRating: number; reviewCount?: number; };
    avgRating?: number;
    totalReviews?: number;
    seller: { avatar: string; name: string; sellerUsername?: string; isOnline: boolean; level?: SellerLevel }
    tags?: string[];
    createdAt?: string | number | Date | undefined;
    variant?: "default" | "compact" | "list" | "grid";
    isFavorited?: boolean;
    onFavorite?: (id: string) => void; // Not really sure what to write here
}


export function GigCard({
    id,
    title,
    coverImage,
    thumbnail,
    images = [],
    tiers,
    price,
    deliveryTime,
    rating,
    avgRating,
    totalReviews,
    seller,
    tags = [],
    variant = "default",
    isFavorited = false,
    onFavorite,
}: GigCardProps) {
    const isCompact = variant === "compact";
    const isList = variant === "list";
    const isGrid = variant === "grid";
    const router = useRouter();

    const reviewCount = rating?.reviewCount ?? 0;

    const displayPrice = price ?? (
        Array.isArray(tiers) && tiers.length > 0 && typeof tiers[0] === "object"
            ? Math.min(...(tiers as GigTier[]).map((t) => Number(t.price) || 0))
            : 0
    )

    const displayDelivery = deliveryTime ?? (
        Array.isArray(tiers) && tiers.length > 0 && typeof tiers[0] === "object"
            ? `${(tiers[0] as GigTier).deliveryDays} days`
            : "1-3 days"
    );

    const displayAvgRating = avgRating ?? rating.avgRating ?? 0;
    const displayReviewCount = totalReviews ?? rating?.reviewCount ?? 0;

    const rawImage =  coverImage || thumbnail || images?.[0];
    const displayImage = 
        typeof rawImage === "string"
            ? rawImage
            : typeof rawImage === "object" && rawImage !== null && "url" in rawImage
            ? (rawImage as { url: string }).url
            : null;

    const sellerName = seller?.name || seller.sellerUsername || "Seller"
    const sellerAvatar = seller?.avatar || "";

    function handleCardClick() {
        router.push(`/gigs/${id}`)
    }

    return (
            <Card
                onClick={handleCardClick}
                className={cn(
                    "overflow-hidden p-0",
                    isList ? "flex flex-row" : "flex flex-col"
                )}
            >
                {/* Thumbnail */}
                <div className={cn(
                    "relative shrink-0 overflow-hidden", 
                    isList 
                        ? "w-40 min-h-[140px]" :  "w-full aspect-video")}>
                    <Image 
                        src={displayImage || "/placeholder.jpg"} 
                        alt={title} 
                        fill 
                        sizes={isList ? "160px" : "(max-width: 768px) 100vw, 300px" }
                        className="object-cover"
                        priority/>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation()
                            onFavorite?.(id);
                        }}
                        className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5"
                    >
                        <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
                    </button>
                </div>

                {/* Content */}
                <div className={cn("flex flex-col gap-2 p-3", isList && "flex-1" )}>
                    <Link
                        href={`/seller/${seller.sellerUsername}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-fit"
                    >
                        <SellerMiniRow 
                            avatar={sellerAvatar}
                            name={sellerName}
                            isOnline={seller.isOnline}
                            level={seller.level}
                            compact={isCompact}
                        />
                    </Link>

                    <p className={cn("font-medium line-clamp-2", isCompact ? "text-xs" : "text-sm")}>
                        {title}
                    </p>

                    {!isCompact && (
                        <RatingInline avgRating={displayAvgRating} reviewCount={displayReviewCount} size="sm"/>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs text-muted-foreground">{displayDelivery}</span>
                        <PriceTag price={displayPrice} showFrom size={isCompact ? "sm" : "lg"} />
                    </div>

                    <div className="flex flex-wrap">
                        {tags && (tags.map((t, i) => (
                            <span key={i}  className="m-1 px-2 p-1 rounded-xl bg-foreground text-xs text-muted/90 font-bold">{t}</span>
                        )))}
                    </div>
                </div>
            </Card>
    )
}