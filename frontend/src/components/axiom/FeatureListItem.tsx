import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";


interface FeatureListItemProps {
    label: string;
    included: boolean;
}

export function FeatureListItem({ label, included }: FeatureListItemProps) {
    return (
        <div className="flex items-center gap-2">
            {included ? (
                <Check className="w-4 h-4 text-green-500 shrink-0"/>
            ) : (
                <X className="w-4 h-4 text-muted-foreground/40 shrink-0"/>
            )}
            <span className={cn("text-sm", !included && "text-muted-foreground/60 line-through")}>
                {label}
            </span>
        </div>
    )
}