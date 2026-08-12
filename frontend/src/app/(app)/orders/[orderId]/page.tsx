export const dynamic = "force-dynamic";
import { PriceTag } from "@/components/axiom/PriceTag";
import { OrderStatusTimeline, type TimelineStep } from "@/components/axiom/OrderStatusTimeline";
// import { OrderRequirementsForm }
import { OrderActionBar } from "@/components/axiom/OrderActionBar";
import { ChatSection } from "@/components/theorems/ChatSection";
import { getOrder, getBuyerOrders } from "@/lib/order";
import { getCurrentUser } from "@/lib/auth";
import { DeliverySection } from "@/components/axiom/DeliverySection";
import { LiveSessionSection } from "@/components/axiom/LiveSessionSection";
import { DisputeDialog } from "@/components/axiom/DisputeDialog";


function mapOrderStatusToSteps(status: string): TimelineStep[] {
    const allSteps = ["PENDING", "ACTIVE", "DELIVERED", "COMPLETED"];
    const currentIndex = allSteps.indexOf(status);

    if (status === "CANCELLED" || status === "DISPUTED") {
        return [{ id: "1", label: status === "CANCELLED" ? "Cancelled" : "Disputed", status: "failed" }]
    }

    return allSteps.map((s, i) => ({
        id: s,
        label: s.charAt(0) + s.slice(1).toLowerCase(),
        status: i < currentIndex ? "completed" : i === currentIndex ? "current" : "upcoming",
    }))
}


export default async function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } =  await params;
    const [order, currentUser] = await Promise.all([getOrder(orderId), getCurrentUser()]);
    
    if (!order) {
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Order not found.</div>
    }
    
    if (!currentUser) {
        return <div className="max-w-4xl mx-auto px-4 py-16 text-center">Please log in to view this order.</div>
    }

    const isBuyer = order?.buyer.id === currentUser?.id;
    const otherUserId = isBuyer ? order?.seller.user.id : order?.buyer.id;
    const isLive = order.gig.deliveryMode === "LIVE";

    function getNextBooking(bookings: any[] | undefined) {
        const now = Date.now();
        return bookings
            ?.filter((b: any) => b.status === "SCHEDULED" && new Date(b.scheduledEnd).getTime() > now)
            ?.sort((a: any, b: any) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
            ?.[0];
    }

    function getPastBookings(bookings: any[] | undefined) {
        const now = Date.now();
        return bookings
            ?.filter((b: any) => 
                b.status === "COMPLETED" ||
                b.status === "CANCELLED" ||
                new Date(b.scheduledEnd).getTime() <= now
            )
            ?.sort((a: any, b: any) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime())
            ?? [];
    }


    function handleSendMessage() {
        console.log("Sending message")
    }

    const nextBooking = getNextBooking(order.sessionPackage?.bookings);
    const pastBookings = getPastBookings(order.sessionPackage?.bookings);

    console.log("[ORDER DEBUG] Session Package Overview:", {
        packageId: order.sessionPackage?.id,
        totalBookingsCount: order.sessionPackage?.bookings?.length ?? 0,
        bookingStatuses: order.sessionPackage?.bookings?.map((b: any) => ({
            id: b.id.slice(0, 8), // short ID
            status: b.status,
            start: b.scheduledStart,
        })),
        nextBooking: nextBooking
            ? { id: nextBooking.id, start: nextBooking.scheduledStart, status: nextBooking.status }
            : null,
        pastBookingsCount: pastBookings?.length ?? 0,
    });
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6 min-w-0">
            <div className="w-full flex items-center justify-between border-b border-border pb-4 gap-4 min-w-0">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold truncate">{order.gig.title}</h1>
                    <p className="text-xs text-muted-foreground cursor-pointer">Order #{order.id.slice(0, 8)}</p>
                </div>
                <div className="shrink-0">
                    <PriceTag price={Number(order.totalPrice)} size="lg"/>
                </div>
            </div>

            <div className="w-full overflow-x-auto">
                <OrderStatusTimeline steps={mapOrderStatusToSteps(order.status)} variant="line" orientation="horizontal" />
            </div>

            {/* {order.status === "ACTIVE" && !order.requirementsSubmittedAt && (
                <OrderRequirementsForm orderId={order.id} /> I have not built this componenet yet
            )} */}

            <div className="w-full min-w-0">
                <ChatSection messagePage={false} otherUserId={otherUserId} currentUserId={currentUser.id}/>
                {isLive ? (
                    <LiveSessionSection order={order} nextBooking={nextBooking} pastBookings={pastBookings} isBuyer={isBuyer} />
                ) : (
                    <DeliverySection orderId={order.id} deliveries={order.orderDeliveries ?? []} variant={isBuyer ? "buyer" : "seller"} canSubmit={!isBuyer && (order.status === "ACTIVE" || order.status === "REVISION_REQUESTED")} />
                )}
            </div>
            
            <OrderActionBar order={order} />
        </div>
    )
}