import { stringify } from "node:querystring";
import { prisma } from "../utils/prisma";

import { PaystackService } from "./paystack.service";
import { TermiiService } from "./termii.service";
import { asyncWrapProviders } from "node:async_hooks";


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
            
            if (order.status === "DISPUTED") {
                console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
                throw new Error("This order is under dispute and cannot be modified until resolved.");
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
        
        if (order.status === "DISPUTED") {
            console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
            throw new Error("This order is under dispute and cannot be modified until resolved.");
        }
        
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
                gig: { 
                    include: { 
                        seller: true
                    }
                 },
                user: true // buyer relation — confirm this is the right relation name in my schema
            }
        });
        
        if (!order) throw new Error("Order not found");
        if (order.status === "DISPUTED") {
            console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
            throw new Error("This order is under dispute and cannot be modified until resolved.");
        }
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
        const platformComissionRate = 0.10;
        const payoutAmountInKobo = Math.round(order.totalPrice * 100 * (1 - platformComissionRate));

        await PaystackService.releaseEscrowToSeller(sellerSubaccount, payoutAmountInKobo, orderId);

        return { completedOrder, order }; // return order so controller has buyer/seller/data
    });

    }

    static async requestOrderRevisison(orderId: string, buyerId: string) {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if(!order) throw new Error("Order not found");
        if (order.status === "DISPUTED") {
            console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
            throw new Error("This order is under dispute and cannot be modified until resolved.");
        }
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

    static async getOrder(orderId: string, userId: string): Promise<any> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                gig: { select: { title: true, coverImage: true } },
                buyer: { select: { id: true, name: true } },
                seller: {
                    include: {
                        user: { select: { id: true, name: true }}
                    }
                },
                gigTier: true
            }
        });

        if (!order) throw new Error("Order not found.");

        // SCEURITY: Is the requester ther buyer or the seller?
        const isBuyer = order.buyerId === userId;
        const isSeller  = order.seller.user.id === userId;

        if (!isBuyer && !isSeller) {
            throw new Error("You do not have the permission to view this order, bro.")
        }

        return order;
    }

    static async getOrdersAsBuyer(userId: string, page: number = 1, limit: number = 20): Promise<any> {
        try {
            const skip = (page - 1) * limit;

            const orders = await prisma.order.findMany({
                where: { buyerId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    gig: { select: { title: true } },
                    seller: { include: { user: { select: { name: true } } } }
                }
            });

            const total = await prisma.order.count({ where: { buyerId: userId } });

            return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
        } catch(error: any) {
            console.error("ERROR getting all order(s) as a Buyer", error)
        }
    }

    static async getMyOrderAsSeller(userId: string, page: number = 1, limit: number = 20): Promise<any> {
        try {
            const skip = (page - 1) * limit;

            // Let's check if this guy is really a Seller hmmmm
            // const user = await prisma.user.findUnique({ where: {  id: userId }, include: { sellerProfile: true } })
            const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
            if (!sellerProfile) throw new Error("You're not a seller or this profile doesn't belong to you.");

            const orders = await prisma.order.findMany({
                where: { sellerId: sellerProfile.id },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    gig: { select: { title: true } },
                    buyer: { select: { name: true } }
                }
            });

            const total = await prisma.order.count({ where: { sellerId: sellerProfile.id } });

            return {
                data: orders,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        } catch (error: any) {
            console.error("ERROR GETTING ORDER(S) AS SELLER", error);
            throw error;
        }
    }

    static async submitOrderRequirements(
        orderId: string, 
        buyerId: string, 
        answers: { questionId: string; answer: string | string[] | boolean }[]
    ): Promise<any> {
        try {
            // 1. Fetch order + gig's requirement templates
            const order = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    gig: {
                        include: {
                            requirementTemplates: true
                        }
                    }
                }
            });

            if (!order) throw new Error("Order not found.");
            if (order.status === "DISPUTED") {
                console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
                throw new Error("This order is under dispute and cannot be modified until resolved.");
            }
            if(order.buyerId !== buyerId) throw new Error("Only teh buyer can submit requirements for this order.");
            if (order.status !== "ACTIVE") throw new Error("Requirements can only be submitted for ACTIVE orders.");
            if (order.requirementsSubmittedAt) throw new Error("Requirements have already been submitted for this order.");

            const templates = order.gig.requirementTemplates;

            const answeredIds = new Set(answers.map(a => a.questionId));

            const requiredTemplates = templates.filter(t => t.isRequired);
            const unanswered = requiredTemplates.filter(t => {
                const answered  =  answeredIds.has(t.id);
                if (!answered) return true;

                // Also check that the answere isn't empty
                const match = answers.find(a => a.questionId === t.id);
                const val = match?.answer;
                if(val === undefined || val === null) return true;
                if (typeof val === "string" && val.trim() === "") return true;
                if (Array.isArray(val) && val.length === 0) return true;

                return false
            });

            if (unanswered.length > 0) {
                throw new Error(
                    `The following required questions must be answered: ${unanswered.map(t => `"${t.question}"`).join(", ")}`
                );
            }

            // validate MULTIPLE CHOICE ansered are still valid options

            for (const answer of answers) {
                const template = templates.find(t => t.id === answer.questionId);
                if(!template) continue;

                if(template.inputType === "MULTIPLE_CHOICE") {
                    const val = answer.answer;
                    const chosen = Array.isArray(val) ? val : [val];
                    const invalid = chosen.filter(c => !template.options.includes(c as string));
                    if (invalid.length > 0) {
                        throw new Error(
                            `Question "${template.question}": invalid option(s) "${invalid.join(", ")}". Valid options: ${template.options.join(", ")}`
                        );
                    }
                }

                if(template.inputType === "YES_NO") {
                    if (answer.answer !== "YES" && answer.answer !== "NO") {
                        throw new Error(`Question "${template.question}": answer must be "YES" or "NO".`);  
                    }
                }
            }
            // store answeres as JSON + flip status to ACTIVE (timer starts now)
            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    requirements: answers,
                    requirementsSubmittedAt: new Date(), // NOT SURE IF THIS <-- IS CORRECT?
                    status: "ACTIVE"
                }
            });
            
             // 5. Notify seller (non-blocking)
            TermiiService.notifySellerRequirementsSubmitted(order.sellerId, orderId).catch(err =>
                console.error("Seller requirements notification failed:", err)
            );

            return updatedOrder;
        } catch(error: any) {
            console.error("ERROR SUBMITTING ORDER REQUIREMENTS", error);
        }
    }

    static async cancelOrder(orderId: string, userId: string, reason: string): Promise<any> {
        try { 
            const order  = await prisma.order.findUnique({
                where: { id: orderId},
                include: { seller: { include: { user: true }} } // i have a seller connnection to the order schema
            });

            if (!order) throw new Error("Order not found.");
            
            if (order.status === "DISPUTED") {
                console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
                throw new Error("This order is under dispute and cannot be modified until resolved.");
            }
            
            const isSeller = order.seller.user.id === userId;
            const isBuyer = order.buyerId === userId;

            if (!isSeller && !isBuyer) {
                throw new Error("You do not have permission ot modify this order.");
            }

            // Branch execution rules by current order state
            switch (order.status) {
                case "PENDING":
                    // No payment has moved yet — just mark cancelled, no refund needed
                    return await prisma.order.update({
                        where: { id: orderId },
                        data: { 
                            status: "CANCELLED", 
                            cancelledAt: new Date(), 
                            cancelReaon: reason 
                        }
                    });

                case "ACTIVE":
                    // Payment was made but seller hasn't delivered yet — full refund to buyer
                    if(!order.paymentReference) {
                        throw new Error("Cannot refund: no payment reference found on this order.");
                    }

                    await PaystackService.initiateRefund(
                        order.paymentReference,
                        Math.round(order.totalPrice * 100) // convert nairs -> kobo
                    );

                    return await prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: "CANCELLED",
                            cancelledAt: new Date(),
                            cancelReason: reason
                        }
                    });

                case "COMPLETED":
                    throw new Error("Cannot cancel a completed order.");
                    
                case "DELIVERED":
                    // Seller already delivered — cancellation not allowed, dispute instead
                    throw new Error("Cannot cancel a delivered order. Open a Dispute instead.");
                    
                case "CANCELLED":
                    throw new Error("Cannot cancel a cancelled order. THIS ORDER HAS BEEN CANCELLED ALREADY!!!");
                    

                default:
                    throw new Error(`Cannot cancel order in status: ${order.status}`);
                    
            }
        } catch(error: any) {
            console.error("ERROR CANCELING ORDER", error)
        }
    }
}
