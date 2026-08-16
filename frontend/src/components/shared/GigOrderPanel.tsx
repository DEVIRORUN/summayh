"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingTierTabs } from "@/components/theorems/PricingTierTabs";
import { PricingTierCardProps, TierTheme } from "@/components/axiom/PricingTierCard";
import { 
  Zap, 
  Star, 
  Crown, 
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SlotPicker } from "@/components/axiom/SlotPicker";
import { useAuth } from "@/contexts/auth-context";

// Matches your backend's GigTier model shape (label, customName, description,
// price, deliveryDays, revisionCount) — this is what gig.tiers contains
// after your API returns the created gig with its tiers included
interface BackendTier {
  label: "BASIC" | "STANDARD" | "PREMIUM"; // matches your TierLabel enum, assumed uppercase
  customName?: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisionCount: number;
  sessionLengthMin?: number | null;
  breakLengthMin?: number | null;
  totalSessions?: number | null;
}

 const tierThemeMap: Record<"basic" | "standard" | "premium", TierTheme> = {
  basic: { label: "Basic", accentColor: "border-slate-400", icon: <Zap className="w-4 h-4 text-slate-400" />, headerStyle: "flat" as const },
  standard: { label: "Standard", accentColor: "border-blue-500", icon: <Star className="w-4 h-4 text-blue-500" />, headerStyle: "outlined" as const },
  premium: { label: "Premium", accentColor: "border-amber-500", icon: <Crown className="w-4 h-4 text-amber-500" />, headerStyle: "gradient" as const },

}; 

export function GigOrderPanel({ sellerId, sellerUserId, gigId, tiers, deliveryMode }: { sellerId: string; sellerUserId: string; gigId: string; tiers: BackendTier[]; deliveryMode: "LIVE" | "DIGITAL"}) {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedTierId, setSelectedTierId] = useState<"basic" | "standard" | "premium">("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const isLive = deliveryMode === "LIVE";

  const isOwnGig = user?.id === sellerUserId;

  if(!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return (
        <div className="border border-border rounded-lg p-6 bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Loading offer details...</p>
        </div>
    )
  }

  if (isOwnGig) {
    return (
      <div className="border border-border rounded-lg p-6 bg-card text-card-foreground shadow-sm text-sm text-muted-foreground">
        This is your own gig - you can&apos;t order it yourself.
      </div>
    )
  }

  // Active Tier Check
  const activeTier = tiers.find((t) => t.label.toLowerCase() === selectedTierId) || tiers[0];
 
  // Map backend tiers to the format PricingTierTabs expects
  const formattedTiers: Omit<PricingTierCardProps, "onSelect" | "isSelected">[] = tiers.map((t) => {
    const tierKey = t.label.toLowerCase() as "basic" | "standard" | "premium";
    const themeObj = tierThemeMap[tierKey] || tierThemeMap.basic;

    return {
      tier: tierKey,
      theme: themeObj,
      price: t.price,
      // description: t.description,
      deliveryDays: t.deliveryDays,
      // sessionLengthMin: t.sessionLengthMin,
      revisions: t.revisionCount === -1 ? "unlimited" : t.revisionCount, 
      features: [] as { label: string; included: boolean }[], // fallabck
      // theme: tierKey,
    };
  });

  async function handleOrderNow() {
    if (!activeTier ) return;
    setIsProcessing(true);

    try {
      // Initialize Paystack transaction via your backend proxy
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: gigId,
          selectedTierLabel: activeTier.label,
          ...(isLive && selectedSlot ? { scheduledStart: selectedSlot.start, scheduledEnd: selectedSlot.end } : {})
        }),
      });

      if (!res.ok) throw new Error("Could not initialize transaction");

      const { checkoutUrl } = await res.json();
      window.location.assign(checkoutUrl);
    } catch (err) {
      setIsProcessing(false);
      alert("Unable to reach Paystack payment gateway. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4 sticky top-4 w-full">
      <PricingTierTabs
        tiers={formattedTiers}
        defaultTier="standard"
        onTierChange={(tier) => {
          setSelectedTierId(tier);
          setSelectedSlot(null) // reset slot on package change
        }}
      />

      {isLive && activeTier?.sessionLengthMin && (
        <div className="flex flex-col gap-2"> 
          <SlotPicker
            sellerId={sellerId}
            sessionLengthMin={activeTier.sessionLengthMin}
            onSelect={setSelectedSlot}
          />
        </div>
      )}

      {/* Action button */}
      <Button size="lg" className="w-full cursor-pointer rounded-sm" onClick={handleOrderNow} disabled={isProcessing || !activeTier || (isLive && !selectedSlot) }>
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to payment...
          </>
        )
          : isLive && !selectedSlot ? (
           "Select a time slot"
          ) : (
             `Order Now - ₦${activeTier?.price.toLocaleString()}`
          )}
      </Button>
    </div>
  );
}