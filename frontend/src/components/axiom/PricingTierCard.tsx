import { PriceTag } from "../axiom/PriceTag";
import { FeatureListItem } from "../axiom/FeatureListItem";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";


export interface TierTheme {
    label: string;
    accentColor: string;
    icon?: ReactNode;
    headerStyle?: "flat" | "gradient" | "outlined"
}

export interface PricingTierCardProps {
    tier: "basic" | "standard" | "premium";
    theme: TierTheme;
    price: number;
    deliveryDays: number;
    revisions: number | "unlimited";
    features: { label: string; included: boolean }[]; // fromFeatureListItems
    isPopular?: boolean;
    isSelected?: boolean;
    onSelect: () => void;
}


// lets say for exmaple
export function PricingTierCard({ 
    // tier,
    theme,
    price,
    deliveryDays,
    revisions,
    features,
    isPopular = false,
    isSelected = false,
    onSelect,
 }: PricingTierCardProps) {
    return (
        <div className={cn(
            "relative flex flex-col rounded-lg border p-4 gap-3 transition bg-background",
            isSelected ? theme.accentColor : "border-border",
            isSelected && "ring-2 ring-offset-1"
        )}>
            {isPopular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">Most Popular</Badge>
            )}

            {/* Header */}
            <div className="flex items-center gap-2">
                {theme.icon}
                <span className="font-semibold">{theme.label}</span>
            </div>

            {/* Price */}
            <PriceTag price={price} size="lg"/>
            
            {/* Delivery + revisions */}
            <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                <span><span className="font-bold text-foreground">Duration:</span> {deliveryDays} Days</span>
                <span>{revisions === "unlimited" ? "Unlimited revisions" : `${revisions} revision` }</span>
            </div>

            {/* Features */}
            <div className="flex flex-col gap-1.5 flex-1">
                {features.map((feature, i) => (
                    <FeatureListItem key={i} label={feature.label} included={feature.included}/>
                ))}
            </div>

            {/* Select button */}
            <Button onClick={onSelect} variant={isSelected ? "default" : "outline"} className="mt-2">
                {isSelected ? "Selected"  : "Select" }
            </Button>
        </div>
    )
}