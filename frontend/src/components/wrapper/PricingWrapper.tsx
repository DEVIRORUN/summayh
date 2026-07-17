"use client";

import { Zap, Star, Crown } from "lucide-react";
import { PricingTierTabs } from "../theorems/PricingTierTabs";

const tierData = [
  {
    tier: "basic" as const,
    theme: {
      label: "Basic",
      accentColor: "border-slate-400",
      icon: <Zap className="w-4 h-4 text-slate-400" />,
      headerStyle: "flat" as const,
    },
    price: 15000,
    deliveryDays: 3,
    revisions: 1,
    features: [
      { label: "1 concept", included: true },
      { label: "Source files", included: true },
      { label: "Commercial license", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    tier: "standard" as const,
    theme: {
      label: "Standard",
      accentColor: "border-blue-500",
      icon: <Star className="w-4 h-4 text-blue-500" />,
      headerStyle: "outlined" as const,
    },
    price: 35000,
    deliveryDays: 5,
    revisions: 3,
    isPopular: true,
    features: [
      { label: "3 concepts", included: true },
      { label: "Source files", included: true },
      { label: "Commercial license", included: true },
      { label: "Priority support", included: false },
    ],
  },
  {
    tier: "premium" as const,
    theme: {
      label: "Premium",
      accentColor: "border-amber-500",
      icon: <Crown className="w-4 h-4 text-amber-500" />,
      headerStyle: "gradient" as const,
    },
    price: 70000,
    deliveryDays: 7,
    revisions: "unlimited" as const,
    features: [
      { label: "Unlimited concepts", included: true },
      { label: "Source files", included: true },
      { label: "Commercial license", included: true },
      { label: "Priority support", included: true },
    ],
  },
];

export function PricingSection() {
    return (
        <PricingTierTabs
            tiers={tierData}
            defaultTier="standard"
            onTierChange={(tier) => console.log("Tier changed to:", tier)}
            />
    )
}