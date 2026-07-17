"use client"

import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriceTag } from "../axiom/PriceTag";
import { RatingInline } from "../axiom/RatingInline";
import { SellerMiniRow, type SellerLevel } from "../axiom/SellerMiniRow";
import { cn } from "@/lib/utils";
import Image from "next/image";

export interface GigCardProps{
    id: string;
    title: string;
    thumbnail: string;
    price: number
    deliveryTime: string;
    rating: { avgRating: number; reviewCount?: number; };
    seller: { avatar: string; name: string; isOnline: boolean; level?: SellerLevel }
    tags?: string[];
    variant?: "default" | "compact" | "list";
    isFavorited?: boolean;
    onFavorite?: () => void; // Not really sure what to write here
}


export function GigCard({
    title,
    thumbnail,
    price,
    deliveryTime,
    rating,
    seller,
    tags,
    variant = "default",
    isFavorited = false,
    onFavorite,
}: GigCardProps) {
    const isCompact = variant === "compact";
    const isList = variant === "list";

    return (
        <Card
            className={cn(
                "overflow-hidden p-0",
                isList ? "flex flex-row" : "flex flex-col"
            )}
        >
            {/* Thumbnail */}
            <div className={cn(
                "relative", 
                isList 
                    ? "w-40 shrink-0" 
                    : "w-full aspect-video")}>
                <Image 
                    src={thumbnail} 
                    alt={title} 
                    fill 
                    sizes={isList ? "160px" : "(max-width: 768px) 100vw, 300px" }
                    className="object-cover"
                    priority/>
                <button
                    onClick={onFavorite}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5"
                >
                    <Heart className={cn("w-4 h-4", isFavorited && "fill-red-500 text-red-500")} />
                </button>
            </div>

            {/* Content */}
            <div className={cn("flex flex-col gap-2 p-3", isList && "flex-1" )}>
                <SellerMiniRow 
                    avatar={seller.avatar}
                    name={seller.name}
                    isOnline={seller.isOnline}
                    level={seller.level}
                    compact={isCompact}
                />

                <p className={cn("font-medium line-clamp-2", isCompact ? "text-xs" : "text-sm")}>
                    {title}
                </p>

                {!isCompact && (
                    <RatingInline avgRating={rating.avgRating} reviewCount={rating.reviewCount} size="sm"/>
                )}

                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted-foreground">{deliveryTime}</span>
                    <PriceTag price={price} showFrom size={isCompact ? "sm" : "lg"} />
                </div>

                <div className="flex">
                    {tags && (tags.map((t, i) => (
                        <span key={i}  className="mx-1 px-2 p-1 rounded-xl bg-foreground text-xs text-muted/90 font-bold">{t}</span>
                    )))}
                </div>
            </div>
        </Card>
    )
}