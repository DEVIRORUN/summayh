"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrderCard } from "@/components/theorems/OrderCard"; // reuse your existing card
import { statusMap } from "@/lib/orderStatus";

interface OrdersTabProps {
    buyerOrders: any[];
    sellerOrders: any[];
    showSellerTab: boolean;
}

export function OrdersTab({ buyerOrders, sellerOrders, showSellerTab }: OrdersTabProps) {
    return (
        <Tabs defaultValue="buying" className="w-full">
            <TabsList className="rounded-sm">
                <TabsTrigger className="cursor-pointer rounded-sm" value="buying">Buying</TabsTrigger>
                {showSellerTab && <TabsTrigger className="cursor-pointer rounded-sm" value="selling">Selling</TabsTrigger>}
            </TabsList>

            <TabsContent value="buying" className="flex flex-col gap-2 mt-4">
                {buyerOrders.length === 0 ? (
                    <span className="text-muted-foreground">{"You haven't bought anything yet."}</span>
                ) : (
                    buyerOrders.map((order) => (
                        <OrderCard 
                            key={order.id}
                            id={order.id}
                            gigTitle={order.gig.title}
                            gigThumbnail={order.gig.coverImage || "/placeholder.jpg"}
                            price={Number(order.totalPrice)}
                            status={statusMap[order.status] || "pending"} // Put the actual db status
                            deadline={new Date(order.createdAt).toLocaleDateString("en-US", { timeZone: "Africa/Lagos" })} // yo be added in db too soon; TODO
                            link={`/orders/${order.id}`}
                            counterpart={{
                                avatar: order.seller.avatar || "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-08-02%20013742.png",
                                name: order.seller.user.name,
                                isOnline: Boolean(order.seller.isOnline)
                        }}
                    />
                    ))
                )}
            </TabsContent>

            <TabsContent value="selling" className="flex flex-col gap-2 mt-4">
                {sellerOrders.length === 0 ? (
                    <span className="text-muted-foreground">No incoming orders yet.</span>
                ) : (
                    sellerOrders.map((order) => (
                        <OrderCard 
                            key={order.id}
                            id={order.id}
                            gigTitle={order.gig.title}
                            gigThumbnail={order.gig.coverImage || "/placeholder.png"}
                            price={Number(order.totalPrice)}
                            status={statusMap[order.status] || "pending"} // Put the actual db status
                            deadline={new Date(order.createdAt).toLocaleDateString("en-US", { timeZone: "Africa/Lagos" })} // yo be added in db too soon; TODO
                            link={`/orders/${order.id}`}
                            counterpart={{
                                avatar: order.buyer.avatar || "https://hsfrsqsscahuvkakghab.supabase.co/storage/v1/object/public/SUMMAYH/Screenshot%202026-08-02%20013742.png",
                                name: order.buyer.name,
                                isOnline: Boolean(order.buyer.isOnline)
                        }}
                    />
                    ))
                )}
            </TabsContent>
        </Tabs>
    )
}