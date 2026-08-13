"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoundersPassService = void 0;
const prisma_1 = require("../utils/prisma"); // adjust to however you import your Prisma client elsewhere
const paystack_service_1 = require("./paystack.service");
class FoundersPassService {
    /**
     * Returns the current active Founders Pass configuration (price, cap, status).
     * Assumes a single active config row exists.
     */
    static async getActiveConfig() {
        const config = await prisma_1.prisma.foundersPassConfig.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
        });
        if (!config) {
            throw new Error("No active Founders Pass configuration found.");
        }
        return config;
    }
    /**
     * Returns how many passes have been sold vs the cap, for the scarcity counter UI.
     */
    static async getFoundersPassAvailability() {
        const config = await this.getActiveConfig(); // Using this operator
        const soldCount = await prisma_1.prisma.foundersPassPurchase.count({
            where: { status: "SUCCESS" },
        });
        return {
            sold: soldCount,
            remaining: Math.max(config.maxPasses - soldCount, 0),
            maxPasses: config.maxPasses,
            priceNaira: config.priceNaira,
            soldOut: soldCount >= config.maxPasses,
        };
    }
    /**
     * Initiates a Founders Pass purchase for a seller.
     * Enforces: one pass per seller, cap not exceeded, config must be active.
     */
    static async initializeFoundersPassPayment(sellerId, buyerEmail) {
        try {
            const config = await this.getActiveConfig();
            const availability = await this.getFoundersPassAvailability();
            if (availability.soldOut) {
                throw new Error("Founders Pass is sold out");
            }
            // Enforce one pass per seller at he application level
            // (DB unique constraint on sellerId is the hard backstop)
            const existing = await prisma_1.prisma.foundersPassPurchase.findFirst({
                where: { sellerId },
            });
            if (existing && existing.status === "SUCCESS") {
                throw new Error("Seller already owns a Founders Pass.");
            }
            // Reuse a still-pending purchase instead of creating suplicates on retry
            let purchase = existing && existing.status === "PENDING" ? existing : null;
            if (!purchase) {
                purchase = await prisma_1.prisma.foundersPassPurchase.create({
                    data: {
                        sellerId,
                        amount: config.priceNaira,
                        paymentRefernce: "", // set right after Paystack responds, below
                        status: "PENDING",
                    },
                });
            }
            const paymentInit = await paystack_service_1.PaystackService.initializeTransaction(buyerEmail, config.priceNaira, { founderPassPurchaseId: purchase.id });
            await prisma_1.prisma.foundersPassPurchase.update({
                where: { id: purchase.id },
                data: { paymentRefernce: paymentInit.data.reference },
            });
            return {
                checkoutUrl: paymentInit.data.authorization_url,
                reference: paymentInit.data.reference,
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Activates a seller's Founders Pass after Paystack confirms payment.
     * Idempotent — safe to call multiple times on webhook retry.
     */
    static async activateFoundersPass(reference) {
        try {
            return await prisma_1.prisma.$transaction(async (tx) => {
                const purchase = await tx.foundersPassPurchase.findUnique({
                    where: { paymentRefernce: reference },
                });
                if (!purchase) {
                    throw new Error(`No Founders Pass purchase found for reference: ${reference}`);
                }
                if (purchase.status === "SUCCESS") {
                    console.log(`[Webhook Info]: Founders Pass ${purchase.id} already activated.`);
                    return { success: true, duplicated: true };
                }
                await tx.foundersPassPurchase.update({
                    where: { id: purchase.id },
                    data: { status: "SUCCESS", paidAt: new Date() },
                });
                // Then we update
                await tx.sellerProfile.update({
                    where: { id: purchase.sellerId },
                    data: {
                        isPro: true,
                        founderBadge: true,
                        founderPassAt: new Date(),
                    },
                });
                console.log(`[Webhook Success]: Founders Pass activated for seller ${purchase.sellerId}`);
                return { success: true };
            });
        }
        catch (error) {
            throw new Error("[Webhook Failure]: Founders Pass was not ACTIVATED");
        }
    }
}
exports.FoundersPassService = FoundersPassService;
