import { Request, Response } from "express";
import { SessionDisputeService } from "../services/sessionDispute.service";
import { handlePrismaError } from "../utils/prismaErrorHandler";
import { prisma } from "../utils/prisma";


export class SessionDisputeController {
    static async raise(req: Request, res: Response): Promise<any> {
        try {
            const userId = (req as any).userId;
            const { bookingId } = req.params;
            const { reason, description } = req.body;

            if(!reason || !description) {
                return res.status(400).json({
                    message: "reason and description are required"
                });
            }

            const dispute = await SessionDisputeService.raiseDispute(
                bookingId as string,
                userId,
                reason,
                description
            );

            return res.status(201).json({
                message: "Session dispute raised. This session's outcome has been frozed pending review.",
                data: dispute
            });
        } catch (err: any) {
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
            const handled = handlePrismaError(err, res);
            if (handled) return;
            return res.status(500).json({ message: "Somethign went wrong raising the dispute." })
        }
    }
    static async resolveSessionLevel(req: Request, res: Response): Promise<any> {
        try {
            const adminId = (req as any).userId;
            const { disputeId } = req.params;
            const { resolution, adminNote } = req.body;

            const validResolutions = ["RESOLVED_BUYER", "RESOLVED_SELLER", "DISMISSED"];
            if(!resolution || !validResolutions.includes(resolution)) {
                return res.status(400).json({
                    message: `resolution is required and must be one of: ${validResolutions.join(", ")}`
                });
            }

            const dispute = await SessionDisputeService.resolveSessionLevel(
                disputeId as string,
                adminId,
                resolution,
                adminNote ?? ""
            );

            return res.status(201).json({
                message: `Session dispute resolved: ${resolution}`,
                data: dispute
            });
        } catch (err: any) {
             console.error("ERROR raising session dispute:", err);
            if (err.message?.includes("already resolved") || err.message?.includes("closed")) {
                return res.status(403).json({ message: err.message });
            }
            const handled = handlePrismaError(err, res);
            if (handled) return;
            return res.status(500).json({ message: "Somethign went wrong raising the dispute." })
        }
    }
    static async escalate(req: Request, res: Response): Promise<any> {
        try {
            const adminId = (req as any).userId;
            const { disputeId } = req.params;

            const dispute = await SessionDisputeService.escalateToOrderDispute(
                disputeId as string,
                adminId,
            );

            return res.status(201).json({
                message: "Session dispute escalated to a full order dispute.",
                data: dispute
            });
        } catch (err: any) {
             console.error("ERROR raising session dispute:", err);
            if (err.message?.includes("no linked order")) {
                return res.status(403).json({ message: err.message });
            }
            const handled = handlePrismaError(err, res);
            if (handled) return;
            return res.status(500).json({ message: "Somethign went wrong raising the dispute." })
        }
    }
    static async listForAdmin(req: Request, res: Response): Promise<any> {
        try {
            const { status } = req.query;

            const disputes = await prisma.sessionDispute.findMany({
                where: status ? { status: status as any } : { status: { in: ["OPEN", "UNDER_REVIEW", "AI_REVIEW"] } },
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
        } catch (err: any) {
            console.error("ERROR listing session disputes:", err);
            const handled = handlePrismaError(err, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong fetching disputes." })
        }
    }
}