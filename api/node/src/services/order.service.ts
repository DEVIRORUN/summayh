import { stringify } from "node:querystring";
import { prisma } from "../utils/prisma";

// import { PaystackService } from "./paystack.service";


export class OrderService {
    private static secretKey = process.env.PAYSTACK_SECRET_KEY;
    /**
   * Processes a successful payment webhook from Paystack
   * @param data The payload data object sent by Paystack
   */
  public static async handleSuccessfulPayment(data: any) {
    const { reference, amount, metadata, customer } = data;

    // 1. Extract your application identifiers (e.g., orderId passed during initialization)
    // Paystack allows passing custom fields inside a 'metadata' object
    const orderId = metadata?.orderId;

    if (!orderId) {
        console.log(`[Webhook Error]: No orderId found in metadata for reference: ${reference}`);
        return { success: false, error: "Missing order identity context" };
    }

    try {
        // 2. Wrap this in a transaction to guarantee data integrity
        return await prisma.$transaction(async (tx) => {
            // Find the target order using the orderId from metadata
            const order = await tx.order.findUnique({
                where: { id: orderId },
            });

            if (!order) {
                throw new Error(`Order not found: ${orderId}`);
            }

            // Prevent duplicate if already paid
            if (order.status === "PAID") {
                console.log(`[Webhook Info]: Order ${orderId} is already marked as PAID.`);
                return { success: true, duplicated: true };
            }

            // 3. Update the order status and log the transaction details
            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'PAID',
                    paymentReference: reference,
                    updatedAt: new Date(),
                },
            });
            console.log(`[Webhook Success]: Order ${orderId} marked as PAID with reference: ${reference} from customer: ${customer}`);

            return { success: true, order: updatedOrder };
        })
    } catch(error) {
        console.error(`[Webhook Processing Failed]: ${error}`);
        throw error;
    }
  }

  /**
     * 1. SELLER SUBMITS WORK
     * Shifts order from ACTIVE to DELIVERED
     */
  static async submitOrderDelivery(orderId: string, sellerId: string) {
    return await prisma.$transaction(async (tx) => {
        // Fetch order and include the gig structure to identify the seller
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: { gig: true }
        });

        if (!order) throw new Error("Order not found.");

        if (order.status !== "PAID") throw new Error("Only active orders can be delivered.");

        if (order.gig.sellerId !== sellerId) throw new Error("Unauthorized. Only the seller can deliver this order.");

        return await tx.order.update({
            where: { id: orderId },
            data: { status: "DELIVERED" }
        })
    })
  }

  static async acceptOrderDelivery(orderId: string, buyerId: string) {
    return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
            where: { id: orderId },
            include: {
                gig: { include: { seller: true } }
            }
        });
        
        if (!order) throw new Error("Order not found");
        if (order.status !== "DELIVERED") throw new Error("Only delivered orders can be accepted.");
        if (order.buyerId !== buyerId) throw new Error("Unauthorized. Only the buyer can accept this delivery.");

        const completedOrder = await tx.order.update({
            where: { id: orderId },
            data: { status: "COMPLETED" }
        });

        const sellerSubaccount = order.gig.seller.paystackSubaccountCode;
        if(!sellerSubaccount) {
            throw new Error("Seller does not have a registered payout subaccount.");
        }

        // const payoutAmountInKobo = Math.round((order.totalPrice * 100) - order.totalPrice * 10);
        const payoutAmountInKobo = Math.round(order.totalPrice * 100);

        await PaystackService.releaseEscrowToSeller(sellerSubaccount, payoutAmountInKobo, orderId);

        return completedOrder;
    });

}

    static async requestOrderRevisison(orderId: string, buyerId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if(!order) throw new Error("Order not found");
        if(order.status !== "DELIVERED") throw new Error("Only Delivered can be review be requested on.");
        if (order.buyerId !== buyerId) throw new Error("Unauthorized. Only the buyer can request for revision.");
        
        return await prisma.order.update({
            where: { id: orderId },
            data: { 
                status: "PAID",
                updatedAt: new Date()
            }
        });
        
    }
}
