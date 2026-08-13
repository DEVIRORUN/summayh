"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionDisputeService = void 0;
const prisma_1 = require("../utils/prisma");
const call_service_1 = require("./call.service");
const dispute_service_1 = require("./dispute.service");
class SessionDisputeService {
    static async raiseDispute(bookingId, userId, reason, description) {
        const booking = await prisma_1.prisma.sessionBooking.findUniqueOrThrow({
            where: { id: bookingId },
            include: {
                package: { include: { order: { include: { seller: true } } } },
                enrollment: { include: { order: { include: { seller: true } } } },
            },
        });
        const order = booking.package?.order ?? booking.enrollment?.order;
        if (!order)
            throw new Error("Booking has no linked order");
        if (userId !== order.buyerId && userId !== order.seller.userId)
            throw new Error("FORBIDDEN");
        const existing = await prisma_1.prisma.sessionDispute.findUnique({ where: { bookingId } });
        if (existing)
            throw new Error("A dispute already exists for this session");
        return prisma_1.prisma.$transaction(async (tx) => {
            const dispute = await tx.sessionDispute.create({
                data: { bookingId, raisedById: userId, reason, description, status: "OPEN" },
            });
            await tx.sessionBooking.update({ where: { id: bookingId }, data: { outcome: "DISPUTED" } });
            return dispute;
        });
    }
    static async resolveSessionLevel(disputeId, adminId, resolution, adminNote) {
        const dispute = await prisma_1.prisma.sessionDispute.findUniqueOrThrow({ where: { id: disputeId } });
        const outcomeMap = {
            RESOLVED_BUYER: "SELLER_MISSED",
            RESOLVED_SELLER: "DONE",
            DISMISSED: "DONE",
        };
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            const d = await tx.sessionDispute.update({
                where: { id: disputeId },
                data: { status: resolution, adminNote, resolvedAt: new Date() },
            });
            await tx.sessionBooking.update({
                where: { id: dispute.bookingId },
                data: { outcome: outcomeMap[resolution] },
            });
            return d;
        });
        const booking = await prisma_1.prisma.sessionBooking.findUniqueOrThrow({ where: { id: dispute.bookingId } });
        if (booking.packageId)
            await call_service_1.CallService.checkPackagePayoutMilestones(booking.packageId);
        return updated;
    }
    static async escalateToOrderDispute(sessionDisputeId, adminId) {
        const sessionDispute = await prisma_1.prisma.sessionDispute.findUniqueOrThrow({
            where: { id: sessionDisputeId },
            include: { booking: { include: { package: { include: { order: true } } } } }
        });
        const order = sessionDispute.booking.package?.order;
        if (!order)
            throw new Error('Cannot escalate: no linked order');
        const orderDispute = await dispute_service_1.DisputeService.openDispute(order.id, order.buyerId, "QUALITY_ISSUES", `Escalated from session dispute: ${sessionDispute.description} of id: ${sessionDisputeId}`, []);
        await prisma_1.prisma.sessionDispute.update({
            where: { id: sessionDisputeId },
            data: { status: "ESCALATED", escalatedDisputeId: orderDispute.id }
        });
        return orderDispute;
    }
}
exports.SessionDisputeService = SessionDisputeService;
