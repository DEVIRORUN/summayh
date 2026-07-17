import { Star } from "lucide-react"
import { cn } from "@/lib/utils";


const sizeClasses = {
    sm: { star: "w-3.5 h-3.5", text: "text-xs"},
    lg: { star: "w-5 h-5", text: "text-base"},
}

interface RatingInlineProps {
    avgRating: number;
    reviewCount?: number;
    size?: "sm" | "lg";
}

export function RatingInline({ avgRating, reviewCount, size = "sm" }: RatingInlineProps) {
    const fillPercent = Math.max(0, Math.min(avgRating / 5, 1)) * 100;
    const classes = sizeClasses[size];

    return (
        <div className="flex items-center gap-1">
            {/* Star stack */}
            <div className="relative flex">
                {/* Bottom layer: empty stars */}
                <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn(classes.star, "text-muted-foreground/30 fill-current")}/>
                    ))}
                </div>

                {/* Top Layer: Filled stars */}
                <div 
                    className="absolute inset-0 flex gap-0.5 overflow-hidden"
                    style={{ width: `${fillPercent}%` }}
                >
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={cn(classes.star, "text-amber-400 fill-current min-w-max")} />
                    ))}
                </div>
            </div>

            <span className={cn("font-medium", classes.text)}>{avgRating.toFixed(1)}</span>

            {reviewCount !== undefined && (
                <span className={cn("text-muted-foreground", classes.text)}>({reviewCount})</span>
            )}
        </div>
    )
}