"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisputeController = void 0;
const prisma_1 = require("../utils/prisma");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
const dispute_service_1 = require("../services/dispute.service");
class DisputeController {
    static async openDispute(req, res) {
        try {
            const buyerId = req.userId;
            const { orderId, reason, description, evidenceUrls } = req.body;
            if (!orderId || !reason || !description) {
                return res.status(400).json({
                    message: "orderId, reason, and description are required."
                });
            }
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId }
            });
            if (order?.buyerId !== buyerId) {
                return res.status(400).json({
                    message: "Only the buyer can open a dispute."
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
            const dispute = await dispute_service_1.DisputeService.openDispute(orderId, buyerId, reason, description, evidenceUrls ?? []);
            return res.status(201).json({
                message: "Dispute opened. Order has been frozen pending resolution.",
                data: dispute
            });
        }
        catch (error) {
            console.error("ERROR opening dispute: ", error);
            if (error.message?.includes("Only the buyer") ||
                error.message?.includes("already exists") ||
                error.message?.includes("Cannot open")) {
                return res.status(400).json({ message: error.messgae });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong opening a dispute." });
        }
    }
    static async getDispute(req, res) {
        try {
            const userId = req.userId;
            const { disputeId } = req.params;
            const dispute = await dispute_service_1.DisputeService.getDispute(disputeId, userId);
            return res.status(200).json({ data: dispute });
        }
        catch (error) {
            console.error("ERROR getting dispute:", error);
            if (error.message?.includes("permission")) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message?.includes("not found")) {
                return res.status(404).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
    static async submitEvidence(req, res) {
        try {
            const userId = req.userId;
            const { disputeId } = req.params;
            const { evidenceUrls } = req.body;
            if (!Array.isArray(evidenceUrls) || evidenceUrls.length === 0) {
                return res.status(400).json({
                    message: "evidenceUrls must be a non-empty array of URLs"
                });
            }
            const updated = await dispute_service_1.DisputeService.submitEvidence(disputeId, userId, evidenceUrls);
            return res.status(200).json({
                message: "Evidence aubmitted successfully",
                data: updated
            });
        }
        catch (error) {
            console.error("ERROR submitting evidence:", error);
            if (error.message?.includes("Only the buye or seller") ||
                error.message?.includes("resolved")) {
                return res.status(403).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
    static async resolveDispute(req, res) {
        try {
            const adminId = req.userId;
            const { disputeId } = req.params;
            const { resolution, winner } = req.body;
            if (!resolution || !winner) {
                return res.status(400).json({
                    message: "winner (buyer | seller) and resolution are required."
                });
            }
            if (winner !== "seller" && winner !== "buyer") {
                return res.status(400).json({
                    message: "winner must be  either 'buyer' or 'seller'."
                });
            }
            const resolved = await dispute_service_1.DisputeService.resolveDispute(disputeId, adminId, winner, resolution);
            return res.status(200).json({
                message: `Disputed resovled in favour of the ${winner}`,
                data: resolved
            });
        }
        catch (error) {
            console.error("ERROR resolving evidence:", error);
            if (error.message?.includes("already resolved") ||
                error.message?.includes("Cannot refund") ||
                error.message?.includes("no registered")) {
                return res.status(403).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
}
exports.DisputeController = DisputeController;
