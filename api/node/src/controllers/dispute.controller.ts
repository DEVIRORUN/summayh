import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { handlePrismaError } from "../utils/prismaErrorHandler";
import { DisputeService } from "../services/dispute.service";

export class DisputeController {

    static async openDispute(req: Request, res: Response): Promise<any> {
        try {
            const buyerId = (req as any).userId;
            const { orderId, reason, description, evidenceUrls } = req.body;

            if (!orderId || !reason || !description) {
                return res.status(400).json({
                    message: "orderId, reason, and description are required."
                });
            }

            const validReasons = [
                "WORK_NOT_DELIVERED",
                "WORK_NOT_AS_DESCRIBED",
                "SELLER_UNRESPONSIVE",
                "QUALITY_ISSUES",
                "OTHER"
            ];

            if (!validReasons.includes(reason)) {
                return res.status(400).json({
                    message: `Invalid reason. Must be one of: ${validReasons.join(", ")}`
                });
            }

            const dispute = await DisputeService.openDispute(
                orderId, buyerId, reason, description, evidenceUrls ?? []
            );

            return res.status(201).json({
                message: "Dispute opened. Order has been frozen pending resolution.",
                data: dispute
            });
        } catch(error: any) {
            console.error("ERROR opening dispute: ", error);
            if (error.message?.includes("Only the buyer") ||
                error.message?.includes("already exists") ||
                error.message?.includes("Cannot open")) {
                    return res.status(400).json({ message: error.messgae });
                }
                const handled =  handlePrismaError(error, res);
                if (handled) return;
                return res.status(500).json({ message: "Something went wrong opening a dispute." })
        }
    }

    static async getDispute(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { disputeId } = req.params;

            const dispute = await DisputeService.getDispute(disputeId as string, userId);
            return res.status(200).json({ data: dispute });
        } catch (error: any) {
            console.error("ERROR getting dispute:", error);
            if (error.message?.includes("permission")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message?.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

    static async submitEvidence(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { disputeId } = req.params;
            const { evidenceUrls } = req.body;

            if (!Array.isArray(evidenceUrls) || evidenceUrls.length === 0) {
                return res.status(400).json({
                    message: "evidenceUrls must be a non-empty array of URLs"
                });
            }

            const updated = await DisputeService.submitEvidence(disputeId as string, userId, evidenceUrls);
            return res.status(200).json({
                message: "Evidence aubmitted successfully",
                data: updated
            });
        } catch (error: any) {
            console.error("ERROR submitting evidence:", error);
            if (error.message?.includes("Only the buye or seller") ||
                error.message?.includes("resolved")) {
                return res.status(403).json({ message: error.message });
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

    static async resolveDispute(req: Request, res: Response): Promise<any> {
        try {
            const adminId = (req as any).userId;
            const { disputeId } = req.params;
            const { resolution, winner } = req.body;

            if (!resolution || !winner) {
                return res.status(400).json({
                    message: "winner (buyer | seller) and resolution are required."
                });
            }

            if(winner !== "seller" && winner !== "buyer") {
                return res.status(400).json({
                    message: "winner must be  either 'buyer' or 'seller'."
                });
            }
            const resolved = await DisputeService.resolveDispute(
                disputeId as string, 
                adminId, 
                winner, 
                resolution);
            return res.status(200).json({
                message: `Disputed resovled in favour of the ${winner}`,
                data: resolved
            });
        } catch (error: any) {
            console.error("ERROR resolving evidence:", error);
            if (error.message?.includes("already resolved") ||
                error.message?.includes("Cannot refund") ||
                error.message?.includes("no registered")) {
                return res.status(403).json({ message: error.message });
            }
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
}