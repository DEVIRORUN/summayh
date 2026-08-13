"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionDisputeController = void 0;
const sessionDispute_service_1 = require("../services/sessionDispute.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
const prisma_1 = require("../utils/prisma");
class SessionDisputeController {
    static async raise(req, res) {
        try {
            const userId = req.userId;
            const { bookingId } = req.params;
            const { reason, description } = req.body;
            if (!reason || !description) {
                return res.status(400).json({
                    message: "reason and description are required"
                });
            }
            const dispute = await sessionDispute_service_1.SessionDisputeService.raiseDispute(bookingId, userId, reason, description);
            return res.status(201).json({
                message: "Session dispute raised. This session's outcome has been frozed pending review.",
                data: dispute
            });
        }
        catch (err) {
            console.error("ERROR raising session dispute:", err);
            if (err.message?.includes("FORBIDDEN")) {
                return res.status(403).json({ message: "You are not authorized to dispute this session." });
            }
            if (err.message?.includes("already exists")) {
                return res.status(400).json({ message: err.message });
            }
            if (err.message?.includes("no linked order")) {
                return res.status(400).json({ message: err.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Somethign went wrong raising the dispute." });
        }
    }
    static async resolveSessionLevel(req, res) {
        try {
            const adminId = req.userId;
            const { disputeId } = req.params;
            const { resolution, adminNote } = req.body;
            const validResolutions = ["RESOLVED_BUYER", "RESOLVED_SELLER", "DISMISSED"];
            if (!resolution || !validResolutions.includes(resolution)) {
                return res.status(400).json({
                    message: `resolution is required and must be one of: ${validResolutions.join(", ")}`
                });
            }
            const dispute = await sessionDispute_service_1.SessionDisputeService.resolveSessionLevel(disputeId, adminId, resolution, adminNote ?? "");
            return res.status(201).json({
                message: `Session dispute resolved: ${resolution}`,
                data: dispute
            });
        }
        catch (err) {
            console.error("ERROR raising session dispute:", err);
            if (err.message?.includes("already resolved") || err.message?.includes("closed")) {
                return res.status(403).json({ message: err.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Somethign went wrong raising the dispute." });
        }
    }
    static async escalate(req, res) {
        try {
            const adminId = req.userId;
            const { disputeId } = req.params;
            const dispute = await sessionDispute_service_1.SessionDisputeService.escalateToOrderDispute(disputeId, adminId);
            return res.status(201).json({
                message: "Session dispute escalated to a full order dispute.",
                data: dispute
            });
        }
        catch (err) {
            console.error("ERROR raising session dispute:", err);
            if (err.message?.includes("no linked order")) {
                return res.status(403).json({ message: err.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Somethign went wrong raising the dispute." });
        }
    }
    static async listForAdmin(req, res) {
        try {
            const { status } = req.query;
            const disputes = await prisma_1.prisma.sessionDispute.findMany({
                where: status ? { status: status } : { status: { in: ["OPEN", "UNDER_REVIEW", "AI_REVIEW"] } },
                include: {
                    booking: {
                        include: {
                            package: { include: { order: { include: { seller: true, buyer: true, gig: true } } } },
                            enrollment: { include: { order: { include: { seller: true, buyer: true } } } },
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
            });
            return res.status(200).json({ data: disputes });
        }
        catch (err) {
            console.error("ERROR listing session disputes:", err);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(err, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong fetching disputes." });
        }
    }
}
exports.SessionDisputeController = SessionDisputeController;
