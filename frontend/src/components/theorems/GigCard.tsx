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
import { CreationState, STEP_ROUTES } from "@/lib/gigSteps";

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
    seller: { avatar: string; sellerUsername: string; isOnline: boolean; isPro?: boolean; level?: SellerLevel }
    tags?: string[];
    createdAt?: string | number | Date | undefined;
    variant?: "default" | "compact" | "list" | "grid";
    state: "DRAFT" | "ACTIVE" | "PAUSED" | "INACTIVE"
    isFavorited?: boolean;
    creationState?: CreationState
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
    state,
    isFavorited = false,
    creationState,
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

    const sellerName = seller.sellerUsername
    // console.log("SELLER DETAILS", sellerName, sellerAvatar)
    const sellerAvatar = seller?.avatar || "";

    function handleCardClick() {
        if (state === "DRAFT") {
            const step = creationState ? STEP_ROUTES[creationState] : "basics";
            router.push(`/gigs/new/${id}/${step}`);
            return;
        }
        router.push(`/gigs/${id}`);
    }

    return (
            <Card
                onClick={handleCardClick}
                className={cn(
                    "overflow-hidden p-0 rounded-md sm:rounded-sm cursor-pointer w-full",
                    "transition-all duration-200 active:scale-[0.98] hover:shadow-md hover:bg-card-foreground/2 hover:border-foreground",
                    isList ? "flex flex-row" : "flex flex-col"
                )}
            >
                {/* Thumbnail */}
                <div className={cn(
                    "relative shrink-0 overflow-hidden bg-muted", 
                    isList 
                        ? "w-20 sm:w-40 h-auto self-stretch" 
                        :  "w-full aspect-video")}>
                    <Image 
                        src={displayImage || "/placeholder.jpg"} 
                        alt={title} 
                        fill 
                        sizes={isList ? "(max-width: 640px) 122px, 160px" : "(max-width: 768px) 100vw, 300px" }
                        className="object-cover"
                        priority/>
                        
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation()
                            onFavorite?.(id);
                        }}
                        className={cn(
                            "absolute top-2 right-2 bg-background/90 rounded-full p-2 min-w-[40px] min-h-[40px] flex items-center justify-center shadow-sm transition-transform active:scale-90",
                            isList && "hidden"
                        )}
                    >
                        <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
                    </button>
                </div>

                {/* Content */}
                <div className={cn("flex flex-col p-3 min-w-0", isList ? "flex-1 gap-1 sm:gap-2" : "gap-2")}>
                    <Link
                        href={`/seller/${seller.sellerUsername}`}
                        onClick={(e) => e.stopPropagation()}
                        className={cn("w-full flex-row justify-between items-center", isList ? "hidden sm:flex" : "flex")}
                    >
                        <SellerMiniRow 
                            avatar={sellerAvatar}
                            name={sellerName}
                            isOnline={seller.isOnline}
                            level={seller.level}
                            compact={isCompact}
                        />
                    </Link>

                    <p className={cn(
                        "font-medium", 
                        isCompact ? "text-xs" : "text-sm",
                        isList ? "line-clamp-1 sm:line-clamp-2" : "line-clamp-2")}>
                        {title}
                    </p>

                    {!isCompact && (
                        <div className={isList ? "hidden sm:flex" : ""}>
                            <RatingInline avgRating={displayAvgRating} reviewCount={displayReviewCount} size="sm" />
                        </div>
                    )}

                    <div className={cn("flex mt-auto", isList ? "flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:justify-between" : "items-center justify-between")}>
                        <span className="text-xs text-muted-foreground">{displayDelivery}</span> 
                        <div className="flex flex-row justify-between w-full">
                            <PriceTag price={displayPrice} showFrom size={isCompact ? "sm" : isList ? "sm" : "lg"} />
                            {isList && state === "DRAFT" && 
                                <span className="text-[10px] font-bold bg-foreground text-background px-2 py-1 rounded-xs shadow-sm sm:hidden">
                                    DRAFT
                                </span>
                            }
                        </div>
                    </div>

                    <div className={cn("flex items-end justify-between gap-1", isList && "hidden sm:flex")}>
                        <div className="flex flex-wrap gap-1">
                            {tags && (tags.map((t, i) => (
                                <span key={i}  className="px-2 py-1 rounded-sm bg-foreground text-xs text-muted/90 font-bold">{t}</span>
                            )))}
                        </div>
                        {state === "DRAFT" &&
                            <span className={cn(
                                "text-[10px] font-bold bg-foreground text-background px-2 py-1 rounded-xs shadow-sm shrink-0",
                                isList && "hidden sm:inline-block"
                            )}>
                                DRAFT
                            </span>
                        }
                    </div>
                </div>
            </Card>
    )
}