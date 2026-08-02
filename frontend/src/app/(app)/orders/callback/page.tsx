"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



export default function OrderCallbackPage() {
    const searchparams = useSearchParams();
    const router = useRouter();
    const reference = searchparams.get("reference");
    const [status, setStatus] = useState<"checking" | "success" | "failed">("checking");

    useEffect(() => {
        if(!reference) return; //  if no reference by by bro NOTHING FOR YOU!!

        let attempts = 0;
        const maxAttempts = 8;// ~16s total at 2s intervals

        const checkStatus = async () => {
            try {
                const res = await fetch(`/api/orders/verify/${reference}`);
                const data = await res.json();

                if(data.status === "ACTIVE") {
                    setStatus("success");
                    setTimeout(() => router.push(`/orders/${data.orderId}`), 1500);
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkStatus, 2000)
                } else {
                    setStatus("failed");
                }
            } catch (err) {
                console.error("[Order Verify]: Failed to check status", err);
                setStatus("failed")
            }
        };

        checkStatus();
    }, [reference]);

    return (
        <div className="text-muted-background flex flex-col items-center justify-center min-h-[50vh] gap-4">
            {status === "checking" && <p className="font-semibold animate-pulse">Confirming your payment...</p>}
            {status === "success" && <p className="font-semibold animate-pulse">Payment confirmed! Redirecting...</p>}
            {status === "failed" && <p>Payment could not be confirmed. Please contact support.</p>}
        </div>
    )
}