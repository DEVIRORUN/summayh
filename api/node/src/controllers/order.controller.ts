import { Request, response, Response } from "express";
import { prisma } from "../utils/prisma";
import { OrderService } from "../services/order.service";
import { PaystackService } from "../services/paystack.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";
import { PrismaClient } from "../../generated/prisma";
import { TermiiService } from "../services/termii.service";


interface TierInput {
    customName?: string;
    description: string;
    price: number;
    deliveryDays: number;
    revisionCount: number;
}
interface GigTiersInput {
    basic: TierInput;
    standard: TierInput;
    premium: TierInput;
}

export class OrderController {

    // POST /api/orders/:id/deliver
    static async deliverOrder(req: Request, res: Response): Promise<any> {
        try {
            const { id: orderId }: any = req.params;
            const sellerId = (req as any).user.id; // Tailor this to your auth token extraction

            const updatedOrder = await OrderService.submitOrderDelivery(orderId, sellerId);
            return res.status(200).json({
                message: "Order marked as delivered successfully. Awaiting buyer approval.",
                order: updatedOrder
            });
        } catch (error) {
            console.error("ERROR in Delivery Order:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

    // POST /api/orders/:id/accept
    static async acceptDelivery(req: Request, res: Response): Promise<any> {
        try {
            const { id: orderId }: any = req.params;
            const buyerId = (req as any).userId;

            // First, we get the delivery state of the Order
            const { completedOrder } = await OrderService.acceptOrderDelivery(orderId, buyerId);

            // Then, query teh db for notification params to ensure relatiosn exist
            const detailedOrder = await prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    buyer: true,
                    seller: true, // No wrries it got it's own phoenNumber
                    gig: true
                }
            });

            // Validation
            if (!detailedOrder) {
                return res.status(404).json({ message: "Order detaiels could not be found for notifications." });
            }

            let notificationWarning: string | null = null;

            const buyerPhone = detailedOrder.buyer.phoneNumber;   
            const sellerPhone = detailedOrder.seller.phoneNumber; // It is compulsory for selelr to have a phoen Number anyways

            // 3. Notify buyer their order is complete
            if (buyerPhone) {
                TermiiService.notifyOrderCompleted(buyerPhone, detailedOrder.gig.title).catch(err => {
                    console.error("Failed to send buyer SMS notification: ", err)
                });
            } else {
                notificationWarning = "Order completed successfully, but buyer SMS notification skipped (No phone number linked).";
            }

            // 4. Notify seller their payout has been sent
            if (sellerPhone) {
                const payoutAmountInNaira = Math.round(detailedOrder.totalPrice * 0.90) // 10% for now as promo for first month opening
            
                TermiiService.notifyPayoutSent(sellerPhone, payoutAmountInNaira).catch(err => {
                    console.error("Failed to send seller SMS notification: ", err)
                });
            }


            // 5. Always return success since the DB update passed.
            return res.status(200).json({
                message: "Delivery accepted. Funds have been released to the seller.",
                order: completedOrder,
                ...(notificationWarning && { warning: notificationWarning })
            });
        } catch (error) {
            console.error("ERROR in Accepting Delivery:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

    // POST /api/orders/:id/revision
    static async requestRevision(req: Request, res: Response): Promise<any> {
        try {
            const { id: orderId }: any = req.params;
            const buyerId = (req as any).userId;

            const revisedOrder = await OrderService.requestOrderRevisison(orderId, buyerId);
            return res.status(200).json({
                message: "Revision requested. the order status has reverted to paid/active",
                order: revisedOrder
            });
        } catch (error) {
            console.error("ERROR in Revision requesting:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

    // POST /api/orders/create
    static async createOrder(req: Request, res: Response): Promise<any> {
        try{
            const buyerId = (req as any).userId; 
            const { buyerEmail, serviceId, amount, selectedTierLabel, requirements } = req.body;
            const { quantity = 1 } = req.body; // from body

            if (!selectedTierLabel) {
                return res.status(400).json({ message: "selectedTierLabel is mandatory." })
            }

            const gig = await prisma.gig.findUnique({ 
                where: { id: serviceId },
                include: { tiers: true }
             });
            if (!gig) return res.status(404).json({ message: "Gig not found." });

            const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
            if (!buyer) return res.status(404).json({ message: "Buyer not found." })

            // Extract targeted tier configuration chosen by the user
            const matchedTier = gig.tiers.find(
                (t) => t.label.toUpperCase() === selectedTierLabel.toUpperCase()
            );
            if (!matchedTier) {
                return res.status(400).json({ 
                    message: `The specified tier "${selectedTierLabel}" does not exist on this gig.` 
                });
            }
            
            let finalPrice = matchedTier?.price * quantity; // default: unit price x quantity

            if (quantity > 1) {
                const bulkBand = await prisma.tierQuantityPrice.findUnique({
                    where: {
                        gigTierId_quantity: {
                            gigTierId: matchedTier.id,
                            quantity: quantity
                        }
                    }
                });
                if (bulkBand) {
                    finalPrice = bulkBand.totalPrice; // seller-defined bulk price
                }
            }
            // 1. Create the order in Prisma
            const newOrder = await prisma.order.create({
                data: {
                    status: "PENDING",
                    totalPrice: amount,
                    commission: finalPrice * 0.10, // 10% commission
                    quantity: quantity,
                    gig: {
                        connect: { id: serviceId }
                    },
                    buyer: {
                        connect: { id: buyerId }
                    },
                    seller: {
                        connect: { id: gig.sellerId }
                    },

                    gigTier: {
                        connect: { id: matchedTier.id }
                    },
                    requirements: requirements || "No specific instruction provided",

                    // Historical snapshots
                    tierLabelSnapshot: matchedTier.label,         // e.g., "BASIC", "STANDARD", or "PREMIUM"
                    tierDescription: matchedTier.description,     // The description string
                    tierNameSnapshot: matchedTier.customName || null,
                    unitPriceSnapshot: finalPrice,                // The numeric price
                    deliveryDaysSnapshot: matchedTier.deliveryDays, // The delivery days integer
                    revisionCountSnapshot: matchedTier.revisionCount
                }
            });

              // Fire and don't block the response on this — notification failure shouldn't break checkout
                TermiiService.notifyOrderPlaced(buyer.phoneNumber, gig.title).catch(err =>
                    console.error("Failed to notify buyer of order placement:", err)
                );

            // 2. Call my beatiful Paystack Service
            const paymentInitialize = await PaystackService.initializeTransaction(
                buyerEmail || buyer.email,
                amount, // Paystack operate in Kobo
                { orderId: newOrder.id }
            )

            // 3. Send the checkout link back to the frontend
            return res.status(201).json({
                message: "Order created successfuly",
                checkoutUrl: paymentInitialize.data.authorization_url, // authorizationUrl
                order: newOrder,
                reference: paymentInitialize.data.reference
            });
        } catch (error) {
            console.error("ERROR in Order Creation:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

    static async cancelOrder(req: Request, res: Response): Promise<any> {
        try {
            const { orderId } = req.params;
            const { reason } = req.body
            const userId = (req as any).userId

            if (!reason ) return res.status(400).json({ message: "Please input the Reason you wnat to cancel this order." })
            const cancel = await OrderService.cancelOrder(orderId as string, userId, reason);

            return res.status(200).json({
                message: "The order was succesfully Cancelled",
                data: cancel
            });
        } catch(error: any) {
            console.error("ERROR IN CANCELLING THE ORDER, MY BRO");
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ messgae: "Error cancelling Order" });
        }
    }

    static async getOrder(req: Request, res: Response): Promise<any> {
        try {
            const { orderId } = req.params;
            if(!orderId) return res.status(400).json({ messsage: "No correct OrderId was Inputed In, bro." })
            const userId = (req as any).userId;
            const order = await OrderService.getOrder(orderId as string, userId);

            return res.status(200).json({ data: order })
        } catch(error: any) {
            console.error("ERROR IN geting Order: ", error);

            // Handled these explicit error better
            if (error.message.includes("not found") || error.message.includes("permission")) {
                return res.status(error.message.includes("permission") ? 403 : 404).json({ 
                    message: error.message 
                });
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong getting Order." });
        }
    }

    static async getOrderAsBuyer(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const orderData = await OrderService.getOrdersAsBuyer(userId, page, limit);
            
            return res.status(200).json({
                message: "Successfully got the order DATA",
                data: orderData
            })
        } catch(error: any) {
            console.error("ERROR in GETTING ORDER AS A BUYER:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong IN gettign order as a buyer." });
        }
    }

    static async getOrderAsSeller(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const orderData = await OrderService.getMyOrderAsSeller(userId, page, limit);
            
            return res.status(200).json({
                message: "Successfully got the order DATA",
                data: orderData
            })
        } catch(error: any) {
            console.error("ERROR in GETTING ORDER AS A SELLER:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong IN gettign order as a seller." });
        }
    }

    static async submitOrderRequirements(req: Request, res: Response): Promise<any> {
        try {
            const buyerId = (req as any).userId;
            const { orderId } = req.params;
            const { answers } = req.body; // This will now be a rich object/array, not just text

            const order = await prisma.order.findUnique({  where: { id: orderId as string } });

            if (!order) return res.status(404).json({ message:"Order not found." });
            if(order.buyerId !== buyerId) {
                return res.status(403).json({ message: "Only the buyer can submit requirements for this order." });
            }
            if (order.status !== "ACTIVE") {
                return res.status(400).json({ message: "Requirements can only be submitted for ACTIVE orders." })
            }

            // Now the actuall submission
            const updatedOrder = await OrderService.submitOrderRequirements(
                orderId as string,
                buyerId,
                answers
            );

            // Notify the Seller via SMS / WhatsApp that has started ticking
            const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
            if (buyer?.phoneNumber) {
                TermiiService.notifySellerRequirementsSubmitted(order.sellerId, order.id).catch(err => {
                    console.error("Notification failed FOR NOTIFYING THE SELLER REQUIREMENTS SUBMIT:", err)
                });
            }

            return res.status(200).json({
                message: "Requirements submitted successfully. Project timer started!",
                data: updatedOrder
            })
        } catch(error: any) {
            console.error("ERROR SUBMITTING ORDER REQUIREMENTS", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

}