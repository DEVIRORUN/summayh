"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingTierTabs } from "@/components/theorems/PricingTierTabs";
import { Button } from "@/components/ui/button";
import { Zap, Star, Crown } from "lucide-react";
import { SlotPicker } from "../axiom/SlotPicker";

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

const tierThemeMap = {
  basic: { label: "Basic", accentColor: "border-slate-400", icon: <Zap className="w-4 h-4 text-slate-400" />, headerStyle: "flat" as const },
  standard: { label: "Standard", accentColor: "border-blue-500", icon: <Star className="w-4 h-4 text-blue-500" />, headerStyle: "outlined" as const },
  premium: { label: "Premium", accentColor: "border-amber-500", icon: <Crown className="w-4 h-4 text-amber-500" />, headerStyle: "gradient" as const },
};

export function GigOrderPanel({ sellerId, gigId, tiers, deliveryMode }: { sellerId: string; gigId: string; tiers: BackendTier[]; deliveryMode: "LIVE" | "DIGITAL"}) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<"basic" | "standard" | "premium">("standard");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const isLive = deliveryMode === "LIVE";

  if(!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return (
        <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
            <p className="text-sm text-muted-foreground animate-pulse text-center">
                Loading pricing plans...
            </p>
        </div>
    )
  }

  // Reshape backend tiers (array, uppercase labels) into what
  // PricingTierTabs/PricingTierCard expect (lowercase tier keys, theme attached)
  const tierCardData = (tiers || []).map((t) => {
    const tierKey = t.label.toLowerCase() as "basic" | "standard" | "premium";
    return {
      tier: tierKey,
      theme: tierThemeMap[tierKey],
      price: t.price,
      deliveryDays: t.deliveryDays,
      revisions: t.revisionCount,
      features: [{ label: t.description, included: true }],
    };
  });

  const activeTier = tiers.find((t) => t.label.toLowerCase() === selectedTier);

  async function handleOrderNow() {
    if (!activeTier) return;
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

      if (!res.ok) throw new Error("Could not start payment");

      const { checkoutUrl } = await res.json();
      
      // Redirect the whole page to Paystack's hosted checkout —
      // this is the standard Paystack flow, not a modal/popup
      window.location.assign(checkoutUrl);
    } catch (err) {
      setIsProcessing(false);
      alert("Something went wrong starting payment. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      <PricingTierTabs
        tiers={tierCardData}
        defaultTier="standard"
        onTierChange={setSelectedTier}
      />

      {isLive && activeTier?.sessionLengthMin && (
        <SlotPicker
          sellerId={sellerId}
          sessionLengthMin={activeTier.sessionLengthMin}
          onSelect={setSelectedSlot}
        />
      )}

      <Button size="lg" className="cursor-pointer rounded-sm" onClick={handleOrderNow} disabled={isProcessing || !activeTier || !selectedSlot }>
        {isProcessing 
          ? "Redirecting to payment..." 
          : isLive && !selectedSlot
          ? "Select a time slot"
          : `Order Now - ₦${activeTier?.price.toLocaleString()}`}
      </Button>
    </div>
  );
}