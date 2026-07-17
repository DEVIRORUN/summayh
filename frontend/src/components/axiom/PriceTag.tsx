import { formatNaira } from "@/lib/utils";
import { cn } from "@/lib/utils";


const sizeClasses: Record<"sm" | "lg", string> = {
    sm: "text-sm font-medium",
    lg: "text-2xl font-bold"
}

interface PriceTag {
    price: number // highlited a special way i geuss
    showFrom?: boolean
    size?: "sm" | "lg"
}

export function PriceTag({ price, showFrom, size = "sm" }: PriceTag) {
    const formatted = formatNaira(price)

    return (
        <span className={cn("text-foreground", sizeClasses[size])}>
            {showFrom && <span className="text-muted-forground text-xs mr-1">From</span> }
            {formatted}
        </span>
    )
}