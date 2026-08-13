"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../utils/prisma");
const __1 = require("..");
const resend_1 = require("../utils/resend");
class NotificationService {
    static async notify({ userId, type, title, body, link, email }) {
        try {
            const notification = await prisma_1.prisma.notification.create({
                data: { userId, type, title, body, link },
            });
            const io = (0, __1.getIO)();
            io?.to(`user:${userId}`).emit('notification:new', notification);
            if (email) {
                resend_1.resend.emails.send({
                    from: "SUMMAYH <notifications@summayh.com>",
                    to: email.to,
                    subject: email.subject,
                    react: email.template,
                }).catch((err) => console.error("[notify] email send failed", err));
            }
            return notification;
        }
        catch (err) {
            throw err;
        }
    }
    static async notifyOrderPlaced(sellerUserId, orderId, gigTitle) {
        return this.notify({
            userId: sellerUserId,
            type: "ORDER_PLACED",
            title: "New order received",
            body: `You just got an order for "${gigTitle}".`,
            link: `/orders/${orderId}`
        });
    }
    static async notifyOrderAccepted(buyerUserId, orderId, gigTitle) {
        return this.notify({
            userId: buyerUserId,
            type: "ORDER_ACCEPTED",
            title: "Order accepted",
            body: `Your order for "${gigTitle}" was accepted.`,
            link: `/orders/${orderId}`
        });
    }
    static async notifySessionReminder(userId, bookingId, minutesUntil) {
        return this.notify({
            userId,
            type: "SESSION_REMINDER",
            title: "Upcoming session",
            body: `Your session starts in "${minutesUntil}" minutes.`,
            link: `/session/${bookingId}`,
        });
    }
    static async notifySessionStarting(userId, bookingId) {
        return this.notify({
            userId,
            type: "SESSION_STARTING",
            title: "Session is starting",
            body: `Your session room is now open - join now.`,
            link: `/session/${bookingId}`,
        });
    }
    static async notifyNoShowRisk(userId, bookingId, role) {
        return this.notify({
            userId,
            type: "SESSION_NO_SHOW_RISK",
            title: "Missed session check-in",
            body: role === "SELLER"
                ? "You didn't join your scheduled session in time."
                : "The seller may have missed your scheduled session.",
            link: `/session/${bookingId}`,
        });
    }
    static async notifyNoShowFlagged(userId, bookingId, missedRole) {
        return this.notify({
            userId,
            type: "NO_SHOW_FLAGGED",
            title: "Session marked as no-show",
            body: `The session was flagged: ${missedRole.toLowerCase()} did not join in time.`,
            link: `/session/${bookingId}`,
        });
    }
    static async notifyPaymentReceived(sellerUserId, orderId, amount) {
        return this.notify({
            userId: sellerUserId,
            type: "PAYMENT_RECEIVED",
            title: "Session marked as no-show",
            body: `You received: ${amount.toLocaleString()} for a completed order.`,
            link: `/dashboard/earnings`,
        });
    }
    static async notifyMilestoneReceived(sellerUserId, packageId, pct) {
        return this.notify({
            userId: sellerUserId,
            type: "MILESTONE_RECEIVED",
            title: "Milestone payout released",
            body: `A ${Math.round(pct * 100)}% milestone payout has been released to you.`,
            link: `/dashboard/earnings`,
        });
    }
    static async notifyDisputeOpened(userId, orderId) {
        return this.notify({
            userId,
            type: "DISPUTE_OPENED",
            title: "Dispute opened",
            body: `A dispute has been opened on one of your orders.`,
            link: `/orders/${orderId}`,
        });
    }
    static async notifyDisputeResolved(userId, orderId, outcome) {
        return this.notify({
            userId,
            type: "DISPUTE_RESOLVED",
            title: "Dispute resolved",
            body: `Your dispute was resolved: ${outcome}`,
            link: `/orders/${orderId}`,
        });
    }
    static async notifyMessageReceived(userId, senderName, conversationId) {
        return this.notify({
            userId,
            type: "MESSAGE_RECEIVED",
            title: "New message",
            body: `${senderName} sent you a message`,
            link: `/messages/${conversationId}`,
        });
    }
    static async notifySellerReconnectGraceExpired(sellerUserId, bookingId) {
        return this.notify({
            userId: sellerUserId,
            type: "SESSION_NO_SHOW_RISK",
            title: "You were disconnected too long",
            body: "You didn't reconnect within the grace period while the buyer was waiting.",
            link: `/session/${bookingId}`,
        });
    }
    static async notifyBuyerAbsenceGraceExpired(sellerUserId, bookingId) {
        return this.notify({
            userId: sellerUserId,
            type: "SESSION_NO_SHOW_RISK",
            title: "Buyer hasn't returned",
            body: "The buyer left the session and hasn't come back after 10 minutes. You may choose to end the session.",
            link: `/session/${bookingId}`,
        });
    }
}
exports.NotificationService = NotificationService;
