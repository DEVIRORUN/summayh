"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DisputeDialog } from "./DisputeDialog";

export function LiveSessionSection({ order, nextBooking, pastBookings = [], isBuyer}: {  order: any; nextBooking: any; pastBookings?: any[]; isBuyer: boolean; }) {
    const [mounted, setMounted] = useState(false);
    const [now, setNow] = useState<Date | null>(null);
    const [disputeBookingId, setDisputeBookingId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true)
        setNow(new Date());
    }, []);
    if (!nextBooking) {
        return (
            <div className="border border-border rounded-md p-4 flex flex-col gap-4">
                <div className="flex flex-col gap">
                    <span className="text-sm font-semibold">No upcoming session schedueld</span>
                    <p className="text-xs text-muted-foreground">
                        {isBuyer ? "Schedule your next session to get started" : "Waiting for the buyer to schedule their next session."}
                    </p>
                </div>
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
    // const leftEarlyThresholdMs =  5 * 60 * 1000;
    // const leftEarly = (sessionTime.getTime() - leftAt.getTime()) > leftEarlyThresholdMs;

    return (
        <div className="border border-border rounded-md p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
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
            </div>
            {mounted && canJoin ? (
                <Link href={`/session/${nextBooking.id}`}>
                    <Button size="sm" className="w-fit cursor-pointer">Join session</Button>
                </Link>
            ) : (
                <Button size="sm" disabled className="w-fit cursor-pointer">Not yet available</Button>
            )}

            <PastSessionsList 
                pastBookings={pastBookings}
                orderId={order.id}
                onReport={setDisputeBookingId}
            />
            
            {disputeBookingId && (
                <DisputeDialog
                    orderId={order.id}
                    bookingId={disputeBookingId}
                    open={!!disputeBookingId}
                    onOpenChange={(v) => !v && setDisputeBookingId(null)}
                />
            )}
        </div>
    )
}

function PastSessionsList({
    pastBookings,
    orderId,
    onReport,
}: {
    pastBookings: any[];
    orderId: string;
    onReport: (bookingId: string) => void;
}) {
    if (!pastBookings || pastBookings.length === 0) return null;

    return (
        <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">Past sessions</h4>
                <ul className="flex flex-col gap-2">
                    {pastBookings.map((booking: any) => (
                        <li key={booking.scheduledStart} className="flex items-center justify-between text-sm border-b border-border py-2">
                            <div className="flex flex-col">
                                <span>
                                    {new Date(booking.scheduledStart).toLocaleDateString([], { month: "short", day: "numeric" })}
                                    {" · "}
                                    {new Date(booking.scheduledStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {booking.outcome}
                                    {booking.sellerLeftEarly && " · Seller left early"}
                                    {booking.buyerLeftEarly && " · Buyer left early"}
                                </span>
                            </div>
                            <Button
                                onClick={() => onReport(booking.id)}
                                className="rounded-sm bg-card cursor-pointer text-xs text-muted-foreground hover:text-destructive underline underline-offset-2 shrink-0"
                            >
                                Report an issue
                            </Button>
                        </li>
                    ))}
                </ul>
        </div>
    )
}