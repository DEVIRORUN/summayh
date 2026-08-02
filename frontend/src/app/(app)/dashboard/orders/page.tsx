import { getBuyerOrders, getSellerOrders, type OrderListItem } from "@/lib/order";
import { getCurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { PriceTag } from "@/components/axiom/PriceTag";
import Link from "next/link";
import { OrdersTab } from "@/components/theorems/OrderTab";

export default async function DashboardOrdersPage() {
    const currentUser = await getCurrentUser();

    if(!currentUser) {
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Please log in to view your orders.</div>
    }

    const isSeller = currentUser.role === "SELLER";

    const [buyerOrders, sellerOrders] = await Promise.all([
        getBuyerOrders(),
        isSeller ? getSellerOrders() : Promise.resolve(null)
    ]);

    if (!buyerOrders) {
        return <div className="max-x-4xl mx-auto px-4 py-16 text-center">Order not found.</div>
    }

    if(!isSeller && buyerOrders.data.length === 0) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-muted-foreground">You have no orders, go buy a gig.</span>
                <Link href="/gigs">
                    <Button variant="outline" className="cursor-pointer rounded-sm">Check out Gigs</Button>
                </Link>
            </div>
        )
    }


    const cumulativePriceSpent = buyerOrders.data.filter((order: OrderListItem) => order.status !== "CANCELLED").reduce((total: number, order: OrderListItem) => {
        return total + Number(order.totalPrice || 0);
    }, 0);

    // const cumulativePriceToBePaid = sellerOrders.data.filter((order: OrderListItem) => order.status !== "CANCELLED").reduce((total: number, order: OrderListItem) => {
    //     return total + Number(order.totalPrice || 0);
    // }, 0);


    return (
        <div className="flex flex-col gap-3 p-4">
            <div className="flex p-5 justify-between">
                <h1 className="text-2xl font-semibold">Order page</h1>
                <div className="flex flex-col items-end">
                    <span className="text-sm text-muted-foreground">Cumulative price (₦)</span>
                    <PriceTag price={cumulativePriceSpent} />
                </div>
            </div>
            <OrdersTab 
                buyerOrders={buyerOrders?.data ?? []}
                sellerOrders={sellerOrders?.data ?? []}
                showSellerTab={isSeller}
            />
        </div>
    )
}