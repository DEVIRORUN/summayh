"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeService = void 0;
const prisma_1 = require("../utils/prisma");
const paystack_service_1 = require("./paystack.service");
class DisputeService {
    // POST /api/disputes
    static async openDispute(orderId, buyerId, reason, description, evidenceUrls) {
        try {
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId },
                include: { dispute: true }
            });
            if (!order)
                throw new Error("Order not found.");
            if (order.buyerId !== buyerId)
                throw new Error("Only the buyer can open a dispute.");
            if (order.dispute)
                throw new Error("There's already a dispute for this order");
            const disputeableStatuses = ["ACTIVE", "DELIVERED", "PAID"];
            if (!disputeableStatuses.includes(order.status)) {
                throw new Error(`Cannot open a dispute on an order with status: ${order.status}`);
            }
            return await prisma_1.prisma.$transaction(async (tx) => {
                await tx.order.update({
                    where: { id: orderId },
                    data: { status: "DISPUTED" }
                });
                // Create a dispute
                const dispute = await tx.dispute.create({
                    data: {
                        orderId,
                        buyerId,
                        sellerId: order.sellerId,
                        reason: reason,
                        description,
                        evidenceUrls: evidenceUrls ?? []
                    }
                });
                const disputeCall = {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ disputeId: dispute.id })
                };
                fetch(`${process.env.FASTAPI_URL}/api/disputes/review`, disputeCall).catch(err => {
                    console.error("FastAPI dispute review call failed: ", err);
                }); // Call to Gemini for review
                return dispute;
            });
        }
        catch (error) {
            console.error("ERROR IN OPENING A DISPUTE: ", error);
            throw new Error("Cannot open a DISPUTE");
        }
    }
    // POST /api/disputes/:disputeId
    static async getDispute(disputeId, userId) {
        try {
            const t = true; // faster way
            const dispute = await prisma_1.prisma.dispute.findUnique({
                where: { id: disputeId },
                include: {
                    order: {
                        select: {
                            id: t,
                            status: t,
                            totalPrice: t,
                            tierLabelSnapshot: t,
                            gig: { select: { title: t } }
                        }
                    },
                    buyer: { select: { id: t, name: t } },
                    seller: { select: { id: t, phoneNumber: t, user: { select: { id: t, name: t } } } },
                }
            });
            if (!dispute)
                throw new Error("Dispute not found.");
            const isBuyer = dispute.buyerId === userId;
            const isSeller = dispute.seller.user
                ? dispute.seller.user.id === userId
                : false;
            if (!isBuyer && !isSeller) {
                throw new Error("You do not have permission to view this dispute.");
            }
            return dispute;
        }
        catch (error) {
            console.error("ERROR IN RETURNING A DISPUTE: ", error);
            throw new Error("Cannot fetch a DISPUTE");
        }
    }
    // POST /api/disputes/:disputeId/evidence
    static async submitEvidence(disputeId, userId, newEvidenceUrls) {
        try {
            const t = true;
            const dispute = await prisma_1.prisma.dispute.findUnique({
                where: { id: disputeId },
                include: { seller: { include: { user: t } } }
            });
            if (!dispute)
                throw new Error("Dispute not found.");
            const isBuyer = dispute.buyerId === userId;
            const isSeller = dispute.seller.user.id === userId;
            if (!isBuyer && !isSeller) {
                throw new Error("Only the buyer or seller on this dispute can submit evidence.");
            }
            const closedStatuses = ["RESOLVED_BUYER", "RESOLVED_SELLER", "CLOSED"];
            if (closedStatuses.includes(dispute.status)) {
                throw new Error("Cannot submit evidence on a resolved or closed dispute");
            }
            if (!newEvidenceUrls || newEvidenceUrls.length === 0) {
                throw new Error("At least one evidence URL is required.");
            }
            return await prisma_1.prisma.dispute.update({
                where: { id: disputeId },
                data: {
                    evidenceUrls: {
                        push: newEvidenceUrls // this appends without overwriting
                    }
                }
            });
        }
        catch (error) {
            console.error("ERROR IN SUBMITTING A DISPUTE: ", error);
            throw new Error("Cannot submit a DISPUTE");
        }
    }
    // POST /api/disputes/:disputeId/resolve {admin only}
    static async resolveDispute(disputeId, adminId, winner, resolution) {
        try {
            const t = true;
            const dispute = await prisma_1.prisma.dispute.findUnique({
                where: { id: disputeId },
                include: {
                    order: t,
                    seller: t
                }
            });
            if (!dispute)
                throw new Error("Dispute not found");
            // const isAdmin = dispute.
            const resolveableStatuses = ["OPEN", "AI_REVIEWED"];
            if (!resolveableStatuses.includes(dispute.status)) {
                throw new Error(`Dispute is already resolved or closed.`);
            }
            return await prisma_1.prisma.$transaction(async (tx) => {
                if (winner === "buyer") {
                    // Full refund to buyer
                    if (!dispute.order.paymentReference) {
                        throw new Error("Cannot refund: no payment reference on this order");
                    }
                    await paystack_service_1.PaystackService.initiateRefund(dispute.order.paymentReference, Math.round(dispute.order.totalPrice * 100));
                    await tx.order.update({
                        where: { id: dispute.orderId },
                        data: { status: "REFUNDED" }
                    });
                    await tx.dispute.update({
                        where: { id: disputeId },
                        data: {
                            status: 'RESOLVED_BUYER',
                            resolution,
                            resolvedAt: new Date(),
                            resolvedby: adminId
                        }
                    });
                }
                else {
                    // Release escrow to seller + deduct .10 share
                    const sellerSubaccount = dispute.seller.paystackSubaccountCode;
                    if (!sellerSubaccount) {
                        throw new Error("Seller has no registered payout subaccount");
                    }
                    const summayhCommissionRate = 0.10;
                    const payoutAmountInKobo = Math.round(dispute.order.totalPrice * 100 * (1 - summayhCommissionRate));
                    // Call paystack to do the work
                    await paystack_service_1.PaystackService.releaseEscrowToSeller(sellerSubaccount, payoutAmountInKobo, dispute.orderId);
                    await tx.order.update({
                        where: { id: dispute.orderId },
                        data: { status: "COMPLETED" }
                    });
                    await tx.dispute.update({
                        where: { id: disputeId },
                        data: {
                            status: "RESOLVED_SELLER",
                            resolution,
                            resolvedAt: new Date(),
                            resolvedby: adminId
                        }
                    });
                }
                return await tx.dispute.findUnique({
                    where: { id: disputeId }
                });
            });
        }
        catch (error) {
            console.error("ERROR IN RESOLVING A DISPUTE: ", error);
            throw new Error("Cannot resolve a DISPUTE");
        }
    }
}
exports.DisputeService = DisputeService;
