"use client";

import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentOrder {
    id: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    tierNameSnapshot?: string;
    gig?: {
        title: string;
    };
    buyer?: {
        name?: string;
        fullName?: string;
        username: string;
    };
}

interface EarningSummary {
    totalEarned?: number;
    pendingPayout?: number;
    orderCount?: number;
    available?: number
}

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const isSeller = user!.role === "SELLER";

    const [orders, setOrders] = useState<RecentOrder[] | null>(null);
    const [earnings, setEarnings] = useState<EarningSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const ordersEndpoint = isSeller
                    ? `/api/orders?limit=5`
                    : `/api/orders/buyer?limit=5`;

                const requests = [fetch(ordersEndpoint)];
                if (isSeller) requests.push(fetch(`/api/earnings/summary`));

                const responses = await Promise.all(requests);
                for (const r of responses) {
                    if (!r.ok) throw new Error('Failed to load dashboard data.')
                }

                if (responses[0]?.ok) {
                    const rawOrders = await responses[0].json();

                    const ordersArray = Array.isArray(rawOrders)
                        ? rawOrders
                        : Array.isArray(rawOrders?.data)
                        ? rawOrders.data
                        : Array.isArray(rawOrders?.orders)
                        ? rawOrders.orders
                        : [];

                    setOrders(ordersArray);
                }

                if (isSeller && responses[1]?.ok) {
                    const earningsData = await responses[1].json();
                    setEarnings(earningsData);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong")
            }
        }
        load();
    }, [isSeller]);

    const totalEarned = earnings?.totalEarned ?? 0;
    const pendingPayout = earnings?.pendingPayout ?? 0;
    const orderCount = earnings?.orderCount ?? 0;

    return (
        <div className="p-6 flex flex-col gap-6 max-w-full overflow-hidden">
            <div>
                <h1 className="text-2xl font-semibold">Welcome back, {user!.name}</h1>
                <p className="text-sm">
                    {isSeller ? "Seller dashboard" : "Buyer dashboard" }
                    {user!.isPro && <span className="font-bold ml-1">Pro</span>}
                </p>
            </div>
            {isSeller && (
                <Link
                    href="/gigs/new/basics"
                    className="text-xs font-medium bg-none w-fit border text-foreground hover:border-foreground duration-200 px-3 py-2 rounded-xs shrink-0"
                >
                    + New gig
                </Link>
            )}

            {error && <span className="text-xs text-red-500">{error}</span>}

            {isSeller && (
                <section className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-sm font-medium">Earnings</h2>
                        <Link href="/dashboard/earnings" className="text-xs underline">
                            View all
                        </Link>
                    </div>
                    {earnings ? (
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Total earned</p>
                                <p className="text-lg font-semibold">
                                     ₦{totalEarned.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Pending payout</p>
                                <p className="text-lg font-semibold">
                                     ₦{pendingPayout.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Orders</p>
                                <p className="text-lg font-semibold">{orderCount}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
                    )}
                </section>
            )}

            <section className="border rounded-md p-4 w-full">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-medium">Recent orders</h2>
                    <Link href="/dashboard/orders" className="text-xs underline">
                        View all
                    </Link>
                </div>
                {orders === null ? (
                    <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
                ) : orders.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No orders yet.</p>
                ) : (
                    <ul className="flex flex-col divide-y w-full">
                        {orders.map((order) => {
                            const gigTitle = order.gig?.title || order.tierNameSnapshot || 'Untitled Order';
                            const buyerName = order.buyer?.name || order.buyer?.fullName || order.buyer?.username ||"Buyer";
                            const amount = Number(order?.totalPrice ?? 0);

                            return (
                                <li key={order.id} className="flex justify-between items-center py-2 text-sm w-full gap-4">
                                    <div className="min-w-0 flex-1 overflow-hidden">
                                        <p className="truncate font-medium">{gigTitle}</p>
                                        <p className="text-xs text-muted-foreground truncate block">
                                            {buyerName} · {order.status}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium shrink-0">
                                        ₦{amount.toLocaleString()}
                                    </p>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>
        </div>
    )
}
