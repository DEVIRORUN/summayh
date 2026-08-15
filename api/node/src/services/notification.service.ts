import { prisma } from "../utils/prisma";
import { getIO } from "..";
import { resend } from "../utils/resend";
import { NotificationType } from "../../generated/prisma";
import React from "react";

interface NotifyParams {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
    email?: {
        to: string;
        subject: string;
        template: React.ReactElement;
    }
}


export class NotificationService {
    static async notify({ userId, type, title, body, link, email }: NotifyParams) {
        try {
            const notification = await prisma.notification.create({
                data: { userId, type, title, body, link },
            });

            const io = getIO();
            io?.to(`user:${userId}`).emit('notification:new', notification);

            if (email) {
                resend.emails.send({
                    from: "SUMMAYH <notifications@summayh.com>",
                    to: email.to,
                    subject: email.subject,
                    react: email.template,
                }).catch((err) => console.error("[notify] email send failed", err));
            }

            return notification;
        } catch (err: any) {
            throw err;
        }
    } 
    static async notifyOrderPlaced(sellerUserId: string, orderId: string, gigTitle: string) {
        return this.notify({
            userId: sellerUserId,
            type: "ORDER_PLACED",
            title: "New order received",
            body:  `You just got an order for "${gigTitle}".`,
            link: `/orders/${orderId}`
        });
    }
    static async notifyOrderAccepted(buyerUserId: string, orderId: string, gigTitle: string) {
        return this.notify({
            userId: buyerUserId,
            type: "ORDER_ACCEPTED",
            title: "Order accepted",
            body:  `Your order for "${gigTitle}" was accepted.`,
            link: `/orders/${orderId}`
        });
    }
    static async notifySessionReminder(userId: string, bookingId: string, minutesUntil: string, counterpartyName: string, gigTitle: string) {
        return this.notify({
            userId,
            type: "SESSION_REMINDER",
            title: "Upcoming session",
            body:  `Your session for "${gigTitle}" with ${counterpartyName} starts in "${minutesUntil}" minutes.`,
            link: `/session/${bookingId}`,
        });
    }
    static async notifySessionStarting(userId: string, bookingId: string) {
        return this.notify({
            userId,
            type: "SESSION_STARTING",
            title: "Session is starting",
            body:  `Your session room is now open - join now.`,
            link: `/session/${bookingId}`,
        });
    }
    static async notifyNoShowRisk(userId: string, bookingId: string, role: "SELLER" | "BUYER", counterpartyName: string) {
        return this.notify({
            userId,
            type: "SESSION_NO_SHOW_RISK",
            title: "Missed session check-in",
            body: role === "SELLER" 
                ? `You didn't join your scheduled session with ${counterpartyName} in time.`
                : `${counterpartyName} may have missed your scheduled session.`,
            link: `/session/${bookingId}`,

        })
    }
    static async notifyNoShowFlagged(userId: string, bookingId: string, missedRole: "SELLER" | "BUYER", missedName: string, gigTitle: string) {
        return this.notify({
            userId,
            type: "NO_SHOW_FLAGGED",
            title: "Session marked as no-show",
            body: `The session for "${gigTitle}" was flagged: ${missedName} ${missedRole.toLowerCase()} did not join in time.`,
            link: `/session/${bookingId}`,
        });
    }
    static async notifyPaymentReceived(sellerUserId: string, orderId: string, amount: number, gigTitle: string) {
        return this.notify({
            userId: sellerUserId,
            type: "PAYMENT_RECEIVED",
            title: "Payment received",
            body: `You received: ${amount.toLocaleString()} for "${gigTitle}".`,
            link: `/dashboard/earnings`,
        });
    }
    static async notifyMilestoneReceived(sellerUserId: string, packageId: string, pct: number, buyerName: string) {
        return this.notify({
            userId: sellerUserId,
            type: "MILESTONE_RECEIVED",
            title: "Milestone payout released",
            body: `A ${Math.round(pct * 100)}% milestone payout for your package with ${buyerName} has been released to you.`,
            link: `/dashboard/earnings`,
        });
    }
    static async notifyDisputeOpened(userId: string, orderId: string) {
        return this.notify({
            userId,
            type: "DISPUTE_OPENED",
            title: "Dispute opened",
            body: `A dispute has been opened on one of your orders.`,
            link: `/orders/${orderId}`,
        });
    }
    static async notifyDisputeResolved(userId: string, orderId: string, outcome: string) {
        return this.notify({
            userId,
            type: "DISPUTE_RESOLVED",
            title: "Dispute resolved",
            body: `Your dispute was resolved: ${outcome}`,
            link: `/orders/${orderId}`,
        });
    }
    static async notifyMessageReceived(userId: string, senderName: string, conversationId: string) {
        return this.notify({
            userId,
            type: "MESSAGE_RECEIVED",
            title: "New message",
            body: `${senderName} sent you a message`,
            link: `/messages/${conversationId}`,
        });
    }
    static async notifySellerReconnectGraceExpired(sellerUserId: string, bookingId: string) {
        return this.notify({
            userId: sellerUserId,
            type: "SESSION_NO_SHOW_RISK",
            title: "You were disconnected too long",
            body: "You didn't reconnect within the grace period while the buyer was waiting.",
            link: `/session/${bookingId}`,
        });
    }
    static async notifyBuyerAbsenceGraceExpired(sellerUserId: string, bookingId: string) {
        return this.notify({
            userId: sellerUserId,
            type: "SESSION_NO_SHOW_RISK",
            title: "Buyer hasn't returned",
            body: "The buyer left the session and hasn't come back after 10 minutes. You may choose to end the session.",
            link: `/session/${bookingId}`,
        });
    }
    static async notifyRevisionRequested(sellerUserId: string, orderId: string) {
        return this.notify({
            userId: sellerUserId,
            type: "MESSAGE_RECEIVED", // reuse closest existing type, or add REVISION_REQUESTED to your enum if you prefer a distinct one
            title: "Revision requested",
            body: "The buyer requested changes to your delivery. Log in to review their feedback and resubmit.",
            link: `/orders/${orderId}`,
        });
    }
}