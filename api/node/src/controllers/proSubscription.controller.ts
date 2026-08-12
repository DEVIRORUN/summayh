import { Request, Response } from "express";
import { ProSubscriptionService } from "../services/proSubscription.service";
import { prisma } from "../utils/prisma";
import { handlePrismaError } from "../utils/prismaErrorHandler";

export class ProSubscriptionController {
    static async listPlans(req: Request, res: Response): Promise<any> {
        try {
            const plans = await ProSubscriptionService.getActivePlans();
            return res.status(200).json({ data: plans });
        } catch (error: any) {
            console.error("ERROR listing pro plans:", error);
            return res.status(500).json({ message: "Failed to fetch plans." })
        }
    }
    static async initialize(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { planId, email } = req.body;

            if (!planId || !email) {
                return res.status(400).json({ message: "planId and email are required." });
            }

            const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
            if (!sellerProfile) {
                return res.status(403).json({ message: "You must be a seller to subscribe to Pro." })
            }

            const result = await ProSubscriptionService.initializeSubscription(sellerProfile.id, planId, email);
            return res.status(200).json({ data: result });
        } catch (error: any) {
            console.error("ERROR initializing pro subscription:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: error.message || "Failed to initialize subscription." })
        }
    }
    static async getMySubscription(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const sellerProfile = await prisma.sellerProfile.findUnique({ where: { userId } });
            if (!sellerProfile) {
                return res.status(403).json({ message: "Not a seller." })
            }

            return res.status(200).json({ 
                data: {
                    isPro: sellerProfile.isPro,
                    proSource: sellerProfile.proSource,
                    proExpiresAt: sellerProfile.proExpiresAt,
                    founderBadge: sellerProfile.founderBadge,
                } 
            });
        } catch (error: any) {
            console.error("ERROR getting subscription status:", error);
            return res.status(500).json({ message: "Failed to fetch subscription." })
        }
    }
}