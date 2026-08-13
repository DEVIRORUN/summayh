"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";

export function OrderActionBar({ order }: { order: any }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const isSeller = user?.id === order.seller.userId;
    const isBuyer = user?.id === order.buyerId;

    async function acceptDelivery(orderId: string) {
        setLoading("accept");
        try {
            const res = await fetch(`/api/orders/${orderId}/accept`, { method: "POST" });
            if (!res.ok) throw new Error((await res.json()).error ?? "Failed to accept delivery delivery");
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(null);
        }
    }

    async function requestRevision(orderId: string) {
        setLoading("revision");
        try {
            const res = await fetch(`/api/orders/${orderId}/revision`, { method: "POST" });
            if (!res.ok) throw new Error((await res.json()).error ?? "Failed to request revision");
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(null);
        }
    }

    if (isBuyer && order.status === "DELIVERED") {
        return (
            <div className="flex gap-2">
                <Button 
                    onClick={() => acceptDelivery(order.id)} 
                    className="bg-muted-foreground hover:bg-foreground cursor-pointer">
                        {loading === "accept" ? "Accepting..." : "Accept Delivery"}
                    </Button>
                <Button 
                    disabled={loading === "revision"}
                    variant="outline" 
                    onClick={() => requestRevision(order.id)} 
                    className="cursor-pointer">
                        {loading === "revision" ? "Requesting..." : "Request Revision"}
                </Button>
            </div>
        );
    }

    return null;
}