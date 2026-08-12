"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";


interface PricingActionButtonsProps {
    type: "founders" | "subscription";
    planId?: string;
}

export function PricingActionButtons({ type, planId }: PricingActionButtonsProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleClick() {
        setLoading(true);
        setError(null);

        try {
            const url = type === "founders" ? "/api/founders-pass/initialize" : "/api/pro-subscriptions/initialize";
            const body = type === "founders" ? {} : { planId };

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || data.message || "Failed to start checkout");
            }

            const { data } = await res.json();
            if (data?.checkoutUrl) {
                window.location.href = data.checkoutUrl; // redirect to Paystack
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mt-3">
            <Button
                onClick={handleClick}
                disabled={loading}
                variant={type === "founders" ? "default" : "outline"}
                className={type === "subscription" ? "w-full rounded-sm cursor-pointer" : "rounded-sm cursor-pointer"}
            >
                {loading ? (
                    <span className="flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </span>
                ) : type === "founders" ? (
                    "Get Founders Pass"
                ) : (
                    "Subscribe"
                )}
            </Button>
            {error && <p className="text-xs text-destructive mt-1">{error}</p> }
        </div>
    )
}