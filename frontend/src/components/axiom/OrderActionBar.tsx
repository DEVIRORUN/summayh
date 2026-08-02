"use client";

import { Button } from "../ui/button";


export function OrderActionBar({ order }: { order: any }) {
    const isSeller = order.seller.userId;
    const isBuyer = order.buyerId;

    async function deliverOrder(orderId: string) {
        console.log("deliverOrder");
    }

    async function acceptDelivery(orderId: string) {
        console.log("acceptDelivery");
    }

    async function requestRevision(orderId: string) {
        console.log("requestRevision");
    }

    if(isSeller && order.status === "ACTIVE") {
        return <Button className="cursor-pointer hover:bg-foreground bg-muted-foreground" onClick={() => deliverOrder(order.id)}>Mark as Delivered</Button>
    }

    if (isBuyer && order.status === "DELIVERED") {
        return (
            <div className="flex gap-2">
                <Button  onClick={() => acceptDelivery(order.id)} className="bg-muted-foreground hover:bg-foreground cursor-pointer">Accept Delivery</Button>
                <Button variant="outline" onClick={() => requestRevision(order.id)} className="cursor-pointer">Request Revision</Button>
            </div>
        )
    }
}