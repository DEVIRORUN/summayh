"use client";

import { SlotPicker } from "@/components/axiom/SlotPicker";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ScheduleSessionPage() {
    const router = useRouter();
    const { orderId } = useParams();
    const [order, setOrder] = useState<{ sellerId: string; sessionLengthMin: number } | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/orders/${orderId}`)
        .then((res) => res.json())
        .then((envelope) => {
            const order = envelope.data;
            setOrder({ 
                sellerId: order.seller.id, 
                sessionLengthMin: order.gigTier.sessionLengthMin 
            }) 
        });
    }, [orderId])

    async function handleConfirm() {
        if (!selectedSlot) return;
        setError(null);
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/orders/${orderId}/schedule-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    scheduledStart: selectedSlot.start,
                    scheduledEnd: selectedSlot.end,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to schedule session.")
            }
            router.push(`/orders/${orderId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong" )
        } finally {
            setIsSubmitting(false);
        }
    }


    if (!order) {
        return <div className="max-w-lg mx-auto py-8 px-4 animate-pulse">Loading...</div>
    }
    return (
        <div className="max-w-lg mx-auto py-8 px-4 flex flex-col gap-4">
            <h1 className="text-xl font-semibold">Schedule your next session</h1>
            <SlotPicker sellerId={order.sellerId} sessionLengthMin={order.sessionLengthMin} onSelect={setSelectedSlot}/>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button onClick={handleConfirm} disabled={!selectedSlot || isSubmitting} className="cursor-pointer">
                {isSubmitting ? "Booking..." : "Confirm session"}
            </Button>
        </div>
    )
}