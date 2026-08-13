"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProSubscriptionController = void 0;
const proSubscription_service_1 = require("../services/proSubscription.service");
const prisma_1 = require("../utils/prisma");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class ProSubscriptionController {
    static async listPlans(req, res) {
        try {
            const plans = await proSubscription_service_1.ProSubscriptionService.getActivePlans();
            return res.status(200).json({ data: plans });
        }
        catch (error) {
            console.error("ERROR listing pro plans:", error);
            return res.status(500).json({ message: "Failed to fetch plans." });
        }
    }
    static async initialize(req, res) {
        try {
            const userId = req.userId;
            const { planId, email } = req.body;
            if (!planId || !email) {
                return res.status(400).json({ message: "planId and email are required." });
            }
            const sellerProfile = await prisma_1.prisma.sellerProfile.findUnique({ where: { userId } });
            if (!sellerProfile) {
                return res.status(403).json({ message: "You must be a seller to subscribe to Pro." });
            }
            const result = await proSubscription_service_1.ProSubscriptionService.initializeSubscription(sellerProfile.id, planId, email);
            return res.status(200).json({ data: result });
        }
        catch (error) {
            console.error("ERROR initializing pro subscription:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: error.message || "Failed to initialize subscription." });
        }
    }
    static async getMySubscription(req, res) {
        try {
            const userId = req.userId;
            const sellerProfile = await prisma_1.prisma.sellerProfile.findUnique({ where: { userId } });
            if (!sellerProfile) {
                return res.status(403).json({ message: "Not a seller." });
            }
            return res.status(200).json({
                data: {
                    isPro: sellerProfile.isPro,
                    proSource: sellerProfile.proSource,
                    proExpiresAt: sellerProfile.proExpiresAt,
                    founderBadge: sellerProfile.founderBadge,
                }
            });
        }
        catch (error) {
            console.error("ERROR getting subscription status:", error);
            return res.status(500).json({ message: "Failed to fetch subscription." });
        }
    }
}
exports.ProSubscriptionController = ProSubscriptionController;
