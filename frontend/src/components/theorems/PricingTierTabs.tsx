"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PricingTierCard, type PricingTierCardProps } from "@/components/axiom/PricingTierCard";
import { cn } from "@/lib/utils";

type TierId = "basic" | "standard" | "premium";



interface PricingTierTabsProps {
    tiers: Omit<PricingTierCardProps, "isSelected" | "onSelect">[];
    defaultTier?: TierId;
    onTierChange?: (tier: TierId) => void;
}

export function PricingTierTabs({
    tiers,
    defaultTier = "standard",
    onTierChange,
}: PricingTierTabsProps) {
    const [selectedTier, setSelectedTier]  =useState<TierId>(defaultTier);

    function handleSelect(tier: TierId) {
        setSelectedTier(tier);
        onTierChange?.(tier);
    }

    return (
        <>
            {/* Mobile */}
            <div className="md:hidden">
                <Tabs value={selectedTier} onValueChange={(val) => handleSelect(val as TierId)}>
                    <TabsList className="w-full mb-2">
                        {tiers.map((t) => (
                            <TabsTrigger key={t.tier} value={t.tier} className="flex-1">
                                {t.theme.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tiers.map((t) => (
                        <TabsContent key={t.tier} value={t.tier}>
                            <PricingTierCard
                                {...t}
                                isSelected={selectedTier === t.tier}
                                onSelect={() => handleSelect(t.tier)}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
            

            {/* Desktop: all three in columns */}
            <div className={cn("hidden md:grid md:grid-cols-3 md:gap-4")}>
                {tiers.map((t) => (
                    <PricingTierCard
                        key={t.tier}
                        {...t}
                        isSelected={selectedTier === t.tier}
                        onSelect={() => handleSelect(t.tier)}
                    />
                ))}
            </div>
        </>
    )
}