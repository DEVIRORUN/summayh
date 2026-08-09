"use client";


import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DigitalPricingGigPage from "@/components/pricing/DigitalPricingForm";
import LivePricingGigPage from "@/components/pricing/LivePricingForm";

export default function PricingGigPage() {
    const { gigId } = useParams();
    const [gig, setGig] = useState<{ deliveryMode: "DIGITAL" | "LIVE" } | null>(null);

    useEffect(() => {
        fetch(`/api/gig/${gigId}`)
            .then((res) => res.json())
            .then(({ data }) => setGig(data));
    }, [gigId])

    if (!gigId) return <div className="p-5 animate-pulse font-semibold">Loading...</div>;

    return gig?.deliveryMode === "LIVE"
        ? <LivePricingGigPage gigId={gigId as string} />
        : <DigitalPricingGigPage gigId={gigId as string} />;
}