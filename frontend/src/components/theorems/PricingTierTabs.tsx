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
        <div className="w-full">
                <Tabs value={selectedTier} onValueChange={(val) => handleSelect(val as TierId)} className="w-full">
                    <TabsList className="w-full grid grid-cols-3 rounded-md mb-3 p-1 bg-muted">
                        {tiers.map((t) => (
                            <TabsTrigger key={t.tier} value={t.tier} className="cursor-pointer capitalize text-xs py-1.5 font-medium rounded-xs data-[state=active]:bg-background data-[state=active]:shadow-xs">
                                {t.theme.label || t.tier}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {tiers.map((t) => (
                        <TabsContent key={t.tier} value={t.tier} className="mt-0 focus-visible:outline-none">
                            <PricingTierCard
                                {...t}
                                isSelected={true} // It's the active tab, so it's always selected
                                onSelect={() => handleSelect(t.tier)}
                            />
                        </TabsContent>
                    ))}
                </Tabs>

            {/* <div className="hidden 2xl:grid lg:grid-cols-3 gap-3 w-full">
                {tiers.map((t) => (
                    <PricingTierCard
                        key={t.tier}
                        {...t}
                        isSelected={selectedTier === t.tier}
                        onSelect={() => handleSelect(t.tier)}
                    />
                ))}
            </div> */}
        </div>
    )
}