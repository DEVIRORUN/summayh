import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { OrderService } from "../services/order.service";
import { PaystackService } from "../services/paystack.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";
import { PrismaClient } from "../../generated/prisma";
import { TermiiService } from "../services/termii.service";

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

            const { completedOrder, order } = await OrderService.acceptOrderDelivery(orderId, buyerId);

            // Notify buyer their order is compleet
            await TermiiService.notifyOrderCompleted(order.user.phoneNumber, order.gig.title);

            // Notify seller their payout has been sent
            const payoutAmountInNaira = Math.round(order.totalPrice * 0.85);
            await TermiiService.notifyPayoutSent(order.gig.seller.phoneNumber, payoutAmountInNaira);

            return res.status(200).json({
                message: "Delivery accepted. Funds have been released to the seller.",
                order: completedOrder
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
            const { buyerEmail, serviceId, amount } = req.body;

            const gig = await prisma.gig.findUnique({ where: { id: serviceId } });
            if (!gig) return res.status(404).json({ message: "Gig not found." });

            const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
            if (!buyer) return res.status(404).json({ message: "Buyer not found." })

            // 1. Create the order in Prisma
            const newOrder = await prisma.order.create({
                data: {
                    status: "PENDING",
                    totalPrice: gig.basePrice,
                    gig: {
                        connect: { id: serviceId }
                    },
                    user: {
                        connect: { id: buyerId }
                    }
                }
            });

              // Fire and don't block the response on this — notification failure shouldn't break checkout
                TermiiService.notifyOrderPlaced(buyer.phoneNumber, gig.title).catch(err =>
                    console.error("Failed to notify buyer of order placement:", err)
                );

            // 2. Call my beatiful Paystack Service
            const paystackData = await PaystackService.initializeTransaction(
                buyerEmail,
                gig.basePrice,
                newOrder.id
            )

            // 3. Send the checkout link back to the frontend
            return res.status(200).json({
                message: "Order created successfuly",
                checkoutUrl: paystackData.data.authorization_url,
                reference: paystackData.data.reference
            });
        } catch (error) {
            console.error("ERROR in Order Creation:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
}