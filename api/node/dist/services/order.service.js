"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const prisma_1 = require("../utils/prisma");
const paystack_service_1 = require("./paystack.service");
const termii_service_1 = require("./termii.service");
const triggers_1 = require("./ranking/triggers");
const notification_service_1 = require("./notification.service");
const OrderPlacedEmail_1 = require("../email/OrderPlacedEmail");
class OrderService {
    static secretKey = process.env.PAYSTACK_SECRET_KEY;
    /**
   * Processes a successful payment webhook from Paystack
   * @param data The payload data object sent by Paystack
   */
    // public static async handleSuccessfulPayment(data: any) {
    //     const { reference, amount, metadata, customer } = data;
    //     // 1. Extract your application identifiers (e.g., orderId passed during initialization)
    //     // Paystack allows passing custom fields inside a 'metadata' object
    //     const orderId = metadata?.orderId;
    //     const { scheduledStart, scheduledEnd } = metadata || {};
    //     if (!orderId) {
    //         console.log(`[Webhook Error]: No orderId found in metadata for reference: ${reference}`);
    //         return { success: false, error: "Missing order identity context" };
    //     }
    //     try {
    //         // 2. Wrap this in a transaction to guarantee data integrity
    //         return await prisma.$transaction(async (tx) => {
    //             // Find the target order using the orderId from metadata
    //             const order = await tx.order.findUnique({
    //                 where: { id: orderId },
    //                 include: { 
    //                     gigTier: true, 
    //                     gig: true,
    //                     buyer: true,
    //                     seller: { include: { user: true } }
    //                 },
    //             });
    //             if (!order) {
    //                 throw new Error(`Order not found: ${orderId}`);
    //             }
    //             if (order.status === "DISPUTED") {
    //                 console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
    //                 throw new Error("This order is under dispute and cannot be modified until resolved.");
    //             }
    //             // Prevent duplicate if already active not paid
    //             if (order.status === "ACTIVE") {
    //                 console.log(`[Webhook Info]: Order ${orderId} is already marked as PAID.`);
    //                 return { success: true, duplicated: true };
    //             }
    //             // 3. Update the order status and log the transaction details
    //             const updatedOrder = await tx.order.update({
    //                 where: { id: orderId },
    //                 data: {
    //                     status: 'ACTIVE',
    //                     paymentReference: reference,
    //                     updatedAt: new Date(),
    //                 },
    //             });
    //             // LIVE gig: create the session apckgae + lock in the first booking
    //             if (order.gig.deliveryMode === "LIVE" && scheduledStart && scheduledEnd) {
    //                 const sessionPackage = await tx.sessionPackage.create({
    //                     data: {
    //                         orderId: order.id,
    //                         gigTierid: order.gigTier.id,
    //                         sessionLengthMin: order.gigTier.sessionLengthMin ?? 30,
    //                         breakLengthMin: order.gigTier.breakLengthMin ?? 0,
    //                         totalSessions: order.gigTier.totalSessions ?? 1,
    //                     }
    //                 });
    //                 // re-check clash at moment of payment [SURE CONFIRMATION]
    //                 // e got booked btw slot-selection and oayment completing
    //                 const conflict = await tx.sessionBooking.findFirst({
    //                     where: {
    //                         status: "SCHEDULED",
    //                         scheduledStart: { lt: new Date(scheduledEnd) },
    //                         scheduledEnd: { gt: new Date(scheduledStart) },
    //                         package: { gigTier: { gig: { sellerId: order.sellerId } } },
    //                     },
    //                 });
    //                 if (conflict) {
    //                     console.warn (`[Webhook Warning]: Slot conflict on order ${orderId}, booking not auto-created.`)
    //                 } else {
    //                     await tx.sessionBooking.create({
    //                         data: {
    //                             packageId: sessionPackage.id,
    //                             scheduledStart: new Date(scheduledStart),
    //                             scheduledEnd: new Date(scheduledEnd),
    //                             status: "SCHEDULED",
    //                         },
    //                     })
    //                 }
    //             }
    //             console.log(`[Webhook Success]: Order ${orderId} marked as PAID with reference: ${reference} from customer: ${customer}`);
    //             return { success: true, order: updatedOrder, sellerUser: order.gig.seller.user, buyerName: order.buyer.name, gigTitle: order.gig.title };
    //         }).then(async (result) => {
    //             if (result.success && !("duplicated" in result)) {
    //                 NotificationService.notify({
    //                     userId: result.sellerUser.id,
    //                     type: "ORDER_PLACED",
    //                     title: "New order received",
    //                     body: `${result.buyerName} just placed an order for "${result.gigTitle}`,
    //                     link: `/dashboard/orders/${orderId}`,
    //                     email: {
    //                         to: result.sellerUser.email,
    //                         subject: "You have a new order on SUMMMAYH",
    //                         template: OrderPlacedEmail({ sellerName: result.sellerUser.name, gigTitle: result.gigTitle })
    //                     },
    //                 }).catch(err => console.error("[notify] failed", err));
    //             }
    //             return result;
    //         })
    //     } catch(error) {
    //         console.error(`[Webhook Processing Failed]: ${error}`);
    //         throw error;
    //     }
    // }
    static async handleSuccessfulPayment(data) {
        const { reference, amount, metadata, customer } = data;
        const orderId = metadata?.orderId;
        const { scheduledStart, scheduledEnd } = metadata || {};
        if (!orderId) {
            console.log(`[Webhook Error]: No orderId found in metadata for reference: ${reference}`);
            return { success: false, error: "Missing order identity context" };
        }
        try {
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                const order = await tx.order.findUnique({
                    where: { id: orderId },
                    include: {
                        gigTier: true,
                        gig: true,
                        buyer: true,
                        seller: { include: { user: true } },
                    },
                });
                if (!order) {
                    throw new Error(`Order not found: ${orderId}`);
                }
                if (order.status === "DISPUTED") {
                    console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
                    throw new Error("This order is under dispute and cannot be modified until resolved.");
                }
                if (order.status === "ACTIVE") {
                    console.log(`[Webhook Info]: Order ${orderId} is already marked as PAID.`);
                    return { success: true, duplicated: true, order: null };
                }
                const updatedOrder = await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'ACTIVE',
                        paymentReference: reference,
                        updatedAt: new Date(),
                    },
                });
                if (order.gig.deliveryMode === "LIVE" && scheduledStart && scheduledEnd) {
                    const sessionPackage = await tx.sessionPackage.create({
                        data: {
                            orderId: order.id,
                            gigTierid: order.gigTier.id,
                            sessionLengthMin: order.gigTier.sessionLengthMin ?? 30,
                            breakLengthMin: order.gigTier.breakLengthMin ?? 0,
                            totalSessions: order.gigTier.totalSessions ?? 1,
                        }
                    });
                    const conflict = await tx.sessionBooking.findFirst({
                        where: {
                            status: "SCHEDULED",
                            scheduledStart: { lt: new Date(scheduledEnd) },
                            scheduledEnd: { gt: new Date(scheduledStart) },
                            package: { gigTier: { gig: { sellerId: order.sellerId } } },
                        },
                    });
                    if (conflict) {
                        console.warn(`[Webhook Warning]: Slot conflict on order ${orderId}, booking not auto-created.`);
                    }
                    else {
                        await tx.sessionBooking.create({
                            data: {
                                packageId: sessionPackage.id,
                                scheduledStart: new Date(scheduledStart),
                                scheduledEnd: new Date(scheduledEnd),
                                status: "SCHEDULED",
                            },
                        });
                    }
                }
                console.log(`[Webhook Success]: Order ${orderId} marked as PAID with reference: ${reference} from customer: ${customer}`);
                return {
                    success: true,
                    duplicated: false,
                    order: updatedOrder,
                    sellerUser: order.seller.user,
                    buyerName: order.buyer.name,
                    gigTitle: order.gig.title,
                };
            });
            // fire notification AFTER the transaction commits — never inside tx, never blocking the webhook response
            if (result.success && !result.duplicated) {
                notification_service_1.NotificationService.notify({
                    userId: result.sellerUser.id,
                    type: "ORDER_PLACED",
                    title: "New order received",
                    body: `${result.buyerName} just placed an order for "${result.gigTitle}"`,
                    link: `/dashboard/orders/${orderId}`,
                    email: {
                        to: result.sellerUser.email,
                        subject: "You have a new order on SUMMAYH",
                        template: (0, OrderPlacedEmail_1.OrderPlacedEmail)({
                            sellerName: result.sellerUser.name,
                            gigTitle: result.gigTitle,
                        }),
                    },
                }).catch((err) => console.error("[notify] failed", err));
            }
            return result;
        }
        catch (error) {
            console.error(`[Webhook Processing Failed]: ${error}`);
            throw error;
        }
    }
    /**
       * 1. SELLER SUBMITS WORK
       * Shifts order from ACTIVE to DELIVERED
       */
    static async submitOrderDelivery(orderId, sellerId) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            // Fetch order and include the gig structure to identify the seller
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { gig: true }
            });
            if (!order)
                throw new Error("Order not found.");
            if (order.status === "DISPUTED") {
                console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
                throw new Error("This order is under dispute and cannot be modified until resolved.");
            }
            if (order.status !== "ACTIVE")
                throw new Error("Only active orders can be delivered.");
            if (order.gig.sellerId !== sellerId)
                throw new Error("Unauthorized. Only the seller can deliver this order.");
            return await tx.order.update({
                where: { id: orderId },
                data: { status: "DELIVERED" }
            });
        });
    }
    static async acceptOrderDelivery(orderId, buyerId) {
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: {
                    gig: {
                        include: {
                            seller: true
                        }
                    },
                    buyer: true // buyer relation — confirm this is the right relation name in my schema
                }
            });
            if (!order)
                throw new Error("Order not found");
            if (order.status === "DISPUTED") {
                console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
                throw new Error("This order is under dispute and cannot be modified until resolved.");
            }
            if (order.status !== "DELIVERED")
                throw new Error("Only delivered orders can be accepted.");
            if (order.buyerId !== buyerId)
                throw new Error("Unauthorized. Only the buyer can accept this delivery.");
            const completedOrder = await tx.order.update({
                where: { id: orderId },
                data: { status: "COMPLETED" }
            });
            const sellerSubaccount = order.gig.seller.paystackSubaccountCode;
            if (!sellerSubaccount) {
                throw new Error("Seller does not have a registered payout subaccount.");
            }
            // const payoutAmountInKobo = Math.round((order.totalPrice * 100) - order.totalPrice * 10);
            const platformComissionRate = 0.10;
            const payoutAmountInKobo = Math.round(order.totalPrice * 100 * (1 - platformComissionRate));
            await paystack_service_1.PaystackService.releaseEscrowToSeller(sellerSubaccount, payoutAmountInKobo, orderId);
            const payoutAmountInNaira = payoutAmountInKobo / 100;
            await tx.ledgerEntry.create({
                data: {
                    userId: order.gig.seller.userId,
                    type: "EARNING",
                    status: "COMPLETED",
                    amount: payoutAmountInNaira,
                    orderId: order.id,
                    description: `Earning from order ${order.id}`
                }
            });
            return { completedOrder, order }; // return order so controller has buyer/seller/data
        });
        // Fire-and-forget, outside the transaction — ranking recalculation
        // doesn't need to be atomic with the order completion + payout itself
        (0, triggers_1.onOrderCompleted)(result.order.gigId).catch(err => console.error(`[OnOrderCompletion]: Failed to trigger ranking recalculation for gig ${result.order.gigId}:`, err));
        return result;
    }
    static async requestOrderRevisison(orderId, buyerId) {
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order)
            throw new Error("Order not found");
        if (order.status === "DISPUTED") {
            console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
            throw new Error("This order is under dispute and cannot be modified until resolved.");
        }
        if (order.status !== "DELIVERED")
            throw new Error("Only Delivered can be review be requested on.");
        if (order.buyerId !== buyerId)
            throw new Error("Unauthorized. Only the buyer can request for revision.");
        return await prisma_1.prisma.order.update({
            where: { id: orderId },
            data: {
                status: "ACTIVE",
                updatedAt: new Date()
            }
        });
    }
    static async getOrder(orderId, userId) {
        console.log("[Order Service]: Hit!!");
        const order = await prisma_1.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                gig: { select: { id: true, title: true, coverImage: true, deliveryMode: true } },
                buyer: { select: { id: true, name: true } },
                seller: {
                    include: {
                        user: { select: { id: true, name: true } },
                    }
                },
                gigTier: true,
                sessionPackage: {
                    include: { bookings: true }
                },
                orderDeliveries: {
                    include: { files: true },
                    orderBy: { createdAt: "desc" }
                },
            }
        });
        if (!order)
            throw new Error("Order not found.");
        // SCEURITY: Is the requester ther buyer or the seller?
        const isBuyer = order.buyerId === userId;
        const isSeller = order.seller.user.id === userId;
        if (!isBuyer && !isSeller) {
            throw new Error("You do not have the permission to view this order, bro.");
        }
        return order;
    }
    static async getOrdersAsBuyer(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const orders = await prisma_1.prisma.order.findMany({
                where: { buyerId: userId },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    gig: { select: { title: true, coverImage: true } },
                    seller: { select: { avatar: true, isOnline: true, user: { select: { name: true } } } }
                }
            });
            const total = await prisma_1.prisma.order.count({ where: { buyerId: userId } });
            // console.log("ORDERS BY BUYERS: ", orders)
            return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
        }
        catch (error) {
            console.error("ERROR getting all order(s) as a Buyer", error);
        }
    }
    static async getMyOrderAsSeller(userId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            // Let's check if this guy is really a Seller hmmmm
            // const user = await prisma.user.findUnique({ where: {  id: userId }, include: { sellerProfile: true } })
            const sellerProfile = await prisma_1.prisma.sellerProfile.findUnique({ where: { userId } });
            if (!sellerProfile)
                throw new Error("You're not a seller or this profile doesn't belong to you.");
            const orders = await prisma_1.prisma.order.findMany({
                where: { sellerId: sellerProfile.id },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    gig: { select: { title: true, coverImage: true } },
                    buyer: { select: { name: true, avatar: true, isOnline: true } }
                }
            });
            const total = await prisma_1.prisma.order.count({ where: { sellerId: sellerProfile.id } });
            // console.log("ORDERS BY SELLERS: ", orders)
            return {
                data: orders,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }
        catch (error) {
            console.error("ERROR GETTING ORDER(S) AS SELLER", error);
            throw error;
        }
    }
    static async getOrderByReference(reference) {
        const order = await prisma_1.prisma.order.findFirst({
            where: { paymentReference: reference },
            select: { id: true, status: true }
        });
        if (!order) {
            throw new Error("Order not found for this payment reference.");
        }
        return order;
    }
    static async submitOrderRequirements(orderId, buyerId, answers) {
        try {
            // 1. Fetch order + gig's requirement templates
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    gig: {
                        include: {
                            requirementTemplates: true
                        }
                    }
                }
            });
            if (!order)
                throw new Error("Order not found.");
            if (order.status === "DISPUTED") {
                console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
                throw new Error("This order is under dispute and cannot be modified until resolved.");
            }
            if (order.buyerId !== buyerId)
                throw new Error("Only the buyer can submit requirements for this order.");
            if (order.status !== "ACTIVE")
                throw new Error("Requirements can only be submitted for ACTIVE orders.");
            if (order.requirementsSubmittedAt)
                throw new Error("Requirements have already been submitted for this order.");
            const templates = order.gig.requirementTemplates;
            const answeredIds = new Set(answers.map(a => a.questionId));
            const requiredTemplates = templates.filter(t => t.isRequired);
            const unanswered = requiredTemplates.filter(t => {
                const answered = answeredIds.has(t.id);
                if (!answered)
                    return true;
                // Also check that the answere isn't empty
                const match = answers.find(a => a.questionId === t.id);
                const val = match?.answer;
                if (val === undefined || val === null)
                    return true;
                if (typeof val === "string" && val.trim() === "")
                    return true;
                if (Array.isArray(val) && val.length === 0)
                    return true;
                return false;
            });
            if (unanswered.length > 0) {
                throw new Error(`The following required questions must be answered: ${unanswered.map(t => `"${t.question}"`).join(", ")}`);
            }
            // validate MULTIPLE CHOICE ansered are still valid options
            for (const answer of answers) {
                const template = templates.find(t => t.id === answer.questionId);
                if (!template)
                    continue;
                if (template.inputType === "MULTIPLE_CHOICE") {
                    const val = answer.answer;
                    const chosen = Array.isArray(val) ? val : [val];
                    const invalid = chosen.filter(c => !template.options.includes(c));
                    if (invalid.length > 0) {
                        throw new Error(`Question "${template.question}": invalid option(s) "${invalid.join(", ")}". Valid options: ${template.options.join(", ")}`);
                    }
                }
                if (template.inputType === "YES_NO") {
                    if (answer.answer !== "YES" && answer.answer !== "NO") {
                        throw new Error(`Question "${template.question}": answer must be "YES" or "NO".`);
                    }
                }
            }
            // store answeres as JSON + flip status to ACTIVE (timer starts now)
            const updatedOrder = await prisma_1.prisma.order.update({
                where: { id: orderId },
                data: {
                    requirements: answers,
                    requirementsSubmittedAt: new Date(), // NOT SURE IF THIS <-- IS CORRECT?
                    status: "ACTIVE"
                }
            });
            // 5. Notify seller (non-blocking)
            termii_service_1.TermiiService.notifySellerRequirementsSubmitted(order.sellerId, orderId).catch(err => console.error("Seller requirements notification failed:", err));
            return updatedOrder;
        }
        catch (error) {
            console.error("ERROR SUBMITTING ORDER REQUIREMENTS", error);
        }
    }
    static async scheduleNextSession(orderId, buyerId, scheduledStart, scheduledEnd) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({
                where: { id: orderId },
                include: { sessionPackage: true, seller: true }
            });
            if (!order)
                throw new Error("Order not found");
            if (order.buyerId !== buyerId)
                throw new Error("Unauthorized.");
            if (!order.sessionPackage)
                throw new Error("This order has no session package.");
            const pkg = order.sessionPackage;
            if (pkg.sessionused >= pkg.totalSessions) {
                throw new Error("All sessions in this package have already been scheduled.");
            }
            // re-check clash at booking time
            const conflict = await tx.sessionBooking.findFirst({
                where: {
                    status: "SCHEDULED",
                    scheduledStart: { lt: new Date(scheduledEnd) },
                    scheduledEnd: { gt: new Date(scheduledStart) },
                    package: { gigTier: { gig: { sellerId: order.sellerId } } }
                },
            });
            if (conflict)
                throw new Error("This slot was just taken. Please pick another.");
            const booking = await tx.sessionBooking.create({
                data: {
                    packageId: pkg.id,
                    scheduledStart: new Date(scheduledStart),
                    scheduledEnd: new Date(scheduledEnd),
                    status: "SCHEDULED",
                },
            });
            await tx.sessionPackage.update({
                where: { id: pkg.id },
                data: { sessionused: { increment: 1 } },
            });
            return booking;
        });
    }
    static async cancelOrder(orderId, userId, reason) {
        try {
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId },
                include: { seller: { include: { user: true } } } // i have a seller connnection to the order schema
            });
            if (!order)
                throw new Error("Order not found.");
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
                    return await prisma_1.prisma.order.update({
                        where: { id: orderId },
                        data: {
                            status: "CANCELLED",
                            cancelledAt: new Date(),
                            cancelReaon: reason
                        }
                    });
                case "ACTIVE":
                    // Payment was made but seller hasn't delivered yet — full refund to buyer
                    if (!order.paymentReference) {
                        throw new Error("Cannot refund: no payment reference found on this order.");
                    }
                    await paystack_service_1.PaystackService.initiateRefund(order.paymentReference, Math.round(order.totalPrice * 100) // convert nairs -> kobo
                    );
                    return await prisma_1.prisma.order.update({
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
        }
        catch (error) {
            console.error("ERROR CANCELING ORDER", error);
        }
    }
}
exports.OrderService = OrderService;
