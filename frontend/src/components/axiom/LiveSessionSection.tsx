"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function LiveSessionSection({ order, nextBooking, isBuyer}: {  order: any; nextBooking: any; isBuyer: boolean; }) {
    const [mounted, setMounted] = useState(false);
    const[now, setNow] = useState<Date | null>(null);
    useEffect(() => {
        setMounted(true)
        setNow(new Date());
    }, []);
    console.log("Next Booking:", nextBooking)
    if (!nextBooking) {
        return (
            <div className="border border-border rounded-md p-4 flex flex-col gap-2">
                <span className="text-sm font-semibold">No upcoming session schedueld</span>
                <p className="text-xs text-muted-foreground">
                    {isBuyer ? "Schedule your next session to get started" : "Waiting for the buyer to schedule their next session."}
                </p>
                {isBuyer && (
                    <Link href={`/orders/${order.id}/schedule`}>
                        <Button size="sm" className="w-fit cursor-pointer">Schedule a session</Button>
                    </Link>
                )}
            </div>
        );
    }

    const sessionTime = new Date(nextBooking.scheduledStart);
    const canJoin = now 
        ? sessionTime.getTime() - now.getTime() < 5 * 60 * 1000 && new Date(nextBooking.scheduledEnd).getTime() > now.getTime()
        : false; // 5 min beforee

    return (
        <div className="border border-border rounded-md p-4 flex flex-col gap-2">
            <span className="text-sm font-semibold">Next session</span>
            <p className="text-xs text-muted-foreground">
                {mounted ? (
                    <>
                        {sessionTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
                        {" · "}
                        {sessionTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit"})}
                    </>
                ) : (
                    <span className="animate-pulse text-sm">Laoding...</span>
                )}
            </p>
            {mounted && canJoin ? (
                <Link href={`/session/${nextBooking.id}`}>
                    <Button size="sm" className="w-fit cursor-pointer">Join session</Button>
                </Link>
            ) : (
                <Button size="sm" disabled className="w-fit cursor-pointer">Not yet available</Button>
            )}
        </div>
    )
}