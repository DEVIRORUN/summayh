"use client";

import { useParams } from "next/navigation";
import DigitalPricingGigPage from "@/components/pricing/DigitalPricingForm";
import LivePricingGigPage from "@/components/pricing/LivePricingForm";
import { useDraftGig } from "@/contexts/draftGigContext";

export default function PricingGigPage() {
    const { draft, refetchDraft } = useDraftGig();
    const { gigId } = useParams<{ gigId: string }>();

    if (!draft) return <div className="p-5 animate-pulse font-semibold">Loading...</div>;

    return draft.deliveryMode === "LIVE"
        ? <LivePricingGigPage gigId={gigId} draft={draft} refetchDraft={refetchDraft} />
        : <DigitalPricingGigPage gigId={gigId} draft={draft} refetchDraft={refetchDraft} />;
}