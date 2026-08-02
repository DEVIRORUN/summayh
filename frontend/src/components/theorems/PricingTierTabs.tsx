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
            <div className="lg:hidden">
                <Tabs value={selectedTier} onValueChange={(val) => handleSelect(val as TierId)}>
                    <TabsList className="w-full rounded-md mb-4">
                        {tiers.map((t) => (
                            <TabsTrigger key={t.tier} value={t.tier} className="flex-1 capitalize rounded-xs">
                                {t.tier}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {tiers.map((t) => (
                        <TabsContent key={t.tier} value={t.tier} className="focus-visible:outline-none">
                            <PricingTierCard
                                {...t}
                                isSelected={true} // It's the active tab, so it's always selected
                                onSelect={() => handleSelect(t.tier)}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            <div className="hidden lg:grid lg:grid-cols-3 lg:gap-4">
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