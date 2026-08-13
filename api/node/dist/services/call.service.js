"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallService = void 0;
const livekit_server_sdk_1 = require("livekit-server-sdk");
const prisma_1 = require("../utils/prisma");
const notification_service_1 = require("./notification.service");
const queue_1 = require("../utils/queue");
const roomService = new livekit_server_sdk_1.RoomServiceClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
const JOIN_WINDOW_MIN = 5; // room is joinable by N mins before main session starts
const NO_SHOW_GRACE_MIN = 10; // The flag if nobody joins after N mins when session starts
const MID_SESSION_SELLER_GRACE_SEC = 90;
const MID_SESSION_BUYER_GRACE_MIN = 10;
class CallService {
    static async prepareSessionRoom(bookingId) {
        try {
            const booking = await prisma_1.prisma.sessionBooking.findUniqueOrThrow({
                where: { id: bookingId },
                include: {
                    callSession: true,
                    package: { include: { order: { include: { seller: true } } } },
                    enrollment: { include: { order: { include: { seller: true } } } },
                }
            });
            if (booking.callSession)
                return booking.callSession; // Alreday prepared, idempotent
            const order = booking.package?.order ?? booking.enrollment?.order;
            if (!order) {
                throw new Error(`SessionBooking ${bookingId} has no linked package or enrollment - cannot resulve buyer/seller`);
            }
            const callerId = order.buyerId;
            const calleeId = order.seller.userId;
            const orderId = order.id;
            const roomName = `session_${bookingId}`;
            await roomService.createRoom({
                name: roomName,
                emptyTimeout: 600, // 10 mins unused -> auto close
                maxParticipants: 3,
            });
            const callSession = await prisma_1.prisma.$transaction(async (tx) => {
                const session = await tx.callSession.create({
                    data: {
                        roomName,
                        callerId,
                        calleeId,
                        orderId,
                        status: "PENDING",
                    },
                });
                await tx.boardSession.create({
                    data: {
                        callSessionId: session.id,
                        mode: "DIGITAL"
                    }
                });
                await tx.sessionBooking.update({
                    where: { id: bookingId },
                    data: { callSessionId: session.id }
                });
                return session;
            });
            return callSession;
        }
        catch (err) {
            if (err.code === "P2002") {
                const existing = await prisma_1.prisma.sessionBooking.findUnique({
                    where: { id: bookingId },
                    include: { callSession: true }
                });
                if (existing?.callSession)
                    return existing.callSession;
            }
            throw err;
        }
    }
    static async joinSession(bookingId, userId) {
        try {
            console.log("[JOIN SESSION]: JOINED INTRO");
            const booking = await prisma_1.prisma.sessionBooking.findFirstOrThrow({
                where: { id: bookingId },
                include: {
                    callSession: true,
                    package: { include: { order: { include: { seller: true } } } },
                    enrollment: { include: { order: { include: { seller: true } } } },
                }
            });
            const order = booking.package?.order ?? booking.enrollment?.order;
            if (!order) {
                throw new Error(`SessionBooking ${bookingId} has no linked enrollment or package`);
            }
            const buyerUserId = order.buyerId;
            const sellerUserId = order.seller.userId;
            if (userId !== buyerUserId && userId !== sellerUserId) {
                throw new Error("FORBIDDEN");
            }
            const now = new Date();
            const windowStart = new Date(booking.scheduledStart.getTime() - JOIN_WINDOW_MIN * 60_000);
            if (now < windowStart) {
                throw new Error("TOO_EARLY");
            }
            if (now > booking.scheduledEnd) {
                throw new Error("TOO_LATE");
            }
            // lazily prepare room if the scheduler job hasn't run yet (safety net) - lazy satrt
            let callSession = booking.callSession;
            if (!callSession) {
                callSession = await this.prepareSessionRoom(bookingId);
            }
            if (callSession.status === "PENDING") {
                await prisma_1.prisma.callSession.update({
                    where: { id: callSession.id },
                    data: { status: "RINGING" },
                });
            }
            const at = new livekit_server_sdk_1.AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
                identity: userId,
                ttl: "10m"
            });
            at.addGrant({ roomJoin: true, room: callSession.roomName, canPublish: true, canSubscribe: true });
            console.log("[JOIN SESSION]: JOINED SUCCESFULLY");
            return { token: await at.toJwt(), url: process.env.LIVEKIT_URL, sessionId: callSession.id };
        }
        catch (err) {
            console.log("Failed to Join Session:", err);
            throw err;
        }
    }
    static async getBookingDetails(bookingId, userId) {
        try {
            const booking = await prisma_1.prisma.sessionBooking.findUnique({
                where: { id: bookingId },
                include: {
                    callSession: {
                        select: {
                            id: true,
                            callerId: true,
                            calleeId: true,
                        }
                    },
                    package: { include: { order: { include: { seller: true } } } },
                    enrollment: { include: { order: { include: { seller: true } } } },
                }
            });
            if (!booking)
                throw new Error("Booking Session not found!");
            const order = booking.package?.order ?? booking.enrollment?.order;
            if (!order) {
                throw new Error(`SessionBooking ${bookingId} has no linked enrollment or package`);
            }
            if (userId !== order.buyerId && userId !== order.seller.userId) {
                throw new Error("FORBIDDEN");
            }
            return booking;
        }
        catch (err) {
            throw err;
        }
    }
    static async resolveSessionOutcome(bookingId) {
        const booking = await prisma_1.prisma.sessionBooking.findUniqueOrThrow({
            where: { id: bookingId },
            include: {
                callSession: { include: { events: true } },
                package: { include: { order: { include: { seller: true } } } },
                enrollment: { include: { order: { include: { seller: true } } } },
            },
        });
        if (booking.outcome !== "PENDING")
            return;
        const events = booking.callSession?.events ?? [];
        const joinedUserIds = new Set(events.filter(e => e.type === "JOINED").map(e => e.metadata?.userId));
        const order = booking.package?.order ?? booking.enrollment?.order;
        if (!order) {
            console.error(`[RESOLVE OUTCOME] booking ${bookingId} has no linked order.`);
            return;
        }
        const sellerUserId = order.seller.userId;
        const buyerUserId = order.buyerId;
        let outcome;
        if (booking.buyerJoinedAt && booking.sellerJoinedAt) {
            outcome = "DONE";
        }
        else if (booking.sellerJoinedAt && !booking.buyerJoinedAt) {
            outcome = "BUYER_MISSED";
        }
        else if (booking.buyerJoinedAt && !booking.sellerJoinedAt) {
            outcome = "SELLER_MISSED";
        }
        else {
            outcome = "BOTH_MISSED";
        }
        const noteParts = [];
        if (booking.sellerLeftEarly) {
            noteParts.push(`Seller disconnected fo r${MID_SESSION_SELLER_GRACE_SEC}s+ while buyer was present` +
                (booking.sellerLeftAt ? `(left at ${booking.sellerLeftAt.toISOString()})` : ""));
        }
        if (booking.buyerLeftEarly) {
            noteParts.push(`Buyer was absent for ${MID_SESSION_BUYER_GRACE_MIN}min+ mid-session` +
                (booking.buyerLeftAt ? `(left at ${booking.buyerLeftAt.toISOString()})` : ""));
        }
        const outcomeNote = noteParts.length > 0 ? noteParts.join("; ") : null;
        await prisma_1.prisma.sessionBooking.update({
            where: { id: bookingId },
            data: {
                outcome,
                status: "COMPLETED",
                outcomeResolvedAt: new Date(),
                outcomeNote,
            },
        });
        if (outcome === "BUYER_MISSED") {
            await notification_service_1.NotificationService.notifyNoShowFlagged(sellerUserId, bookingId, "BUYER"); // seller showed up but no buyer
        }
        else if (outcome === "SELLER_MISSED") {
            await notification_service_1.NotificationService.notifyNoShowFlagged(buyerUserId, bookingId, "SELLER");
        }
        else if (outcome === "BOTH_MISSED") {
            await notification_service_1.NotificationService.notifyNoShowFlagged(sellerUserId, bookingId, "BUYER");
            await notification_service_1.NotificationService.notifyNoShowFlagged(buyerUserId, bookingId, "SELLER");
        }
        const bookingWithPackage = await prisma_1.prisma.sessionBooking.findUnique({ where: { id: bookingId } });
        if (bookingWithPackage?.packageId) {
            await this.checkPackagePayoutMilestones(bookingWithPackage.packageId);
        }
    }
    static async handleParticipantJoined(event) {
        const bookingId = event?.room?.name.replace("session_", "");
        const userId = event.participant?.identity;
        if (!bookingId || !userId)
            return;
        const booking = await prisma_1.prisma.sessionBooking.findUnique({
            where: { id: bookingId },
            include: {
                callSession: true,
                package: { include: { order: { include: { seller: true } } } },
                enrollment: { include: { order: { include: { seller: true } } } },
            },
        });
        if (!booking?.callSession)
            return;
        const order = booking.package?.order ?? booking.enrollment?.order;
        if (!order)
            return;
        const isSeller = userId === order.seller.userId;
        const isBuyer = userId === order.buyerId;
        if (!isSeller && !isBuyer)
            return;
        await prisma_1.prisma.callEvent.create({
            data: { sessionId: booking.callSession.id, type: "JOINED", metadata: { userId } },
        });
        const data = {};
        if (isBuyer && !booking.buyerJoinedAt)
            data.buyerJoinedAt = new Date();
        if (isSeller && !booking.sellerJoinedAt)
            data.sellerJoinedAt = new Date();
        if (Object.keys(data).length > 0) {
            await prisma_1.prisma.sessionBooking.update({ where: { id: bookingId }, data });
        }
    }
    static async handleParticipantLeft(event) {
        const bookingId = event?.room?.name.replace("session_", "");
        const userId = event.participant?.identity;
        if (!bookingId || !userId)
            return;
        const booking = await prisma_1.prisma.sessionBooking.findUnique({
            where: { id: bookingId },
            include: {
                callSession: true,
                package: { include: { order: { include: { seller: true } } } },
                enrollment: { include: { order: { include: { seller: true } } } },
            },
        });
        if (!booking?.callSession)
            return;
        const order = booking.package?.order ?? booking.enrollment?.order;
        if (!order)
            return;
        const isSeller = userId === order.seller.userId;
        const isBuyer = userId === order.buyerId;
        if (!isSeller && !isBuyer)
            return;
        await prisma_1.prisma.callEvent.create({
            data: { sessionId: booking.callSession.id, type: "LEFT", metadata: { userId } },
        });
        await prisma_1.prisma.sessionBooking.update({
            where: { id: bookingId },
            data: isBuyer ? { buyerLeftAt: new Date() } : { sellerLeftAt: new Date() },
        });
        if (isSeller) {
            const buyerStillIn = await this.isStillInRoom(bookingId, order.buyerId);
            if (buyerStillIn) {
                await queue_1.callQueue.add("seller-reconnect-check", { bookingId, sellerUserId: order.seller.userId }, { delay: MID_SESSION_SELLER_GRACE_SEC * 1000 });
            }
        }
        if (isBuyer) {
            const sellerStillIn = await this.isStillInRoom(bookingId, order.seller.userId);
            if (sellerStillIn) {
                await queue_1.callQueue.add("buyer-absence-check", { bookingId, buyerUserId: order.buyerId, sellerUserId: order.seller.userId }, { delay: MID_SESSION_BUYER_GRACE_MIN * 60_000 });
            }
        }
    }
    static async isStillInRoom(bookingId, targetUserId) {
        const booking = await prisma_1.prisma.sessionBooking.findUnique({
            where: { id: bookingId },
            include: { callSession: { include: { events: { orderBy: { createdAt: "desc" } } } } }
        });
        const userEvents = booking?.callSession?.events.filter((e) => e.metadata?.userId == targetUserId) ?? [];
        return userEvents[0]?.type === "JOINED";
    }
    static async checkSellerReconnected(bookingId, sellerUserId) {
        const stillGone = !(await this.isStillInRoom(bookingId, sellerUserId));
        if (stillGone) {
            await prisma_1.prisma.sessionBooking.update({
                where: { id: bookingId },
                data: { sellerLeftEarly: true },
            });
            await notification_service_1.NotificationService.notifySellerReconnectGraceExpired(sellerUserId, bookingId);
        }
    }
    static async checkBuyerReturned(bookingId, buyerUserId, sellerUserId) {
        const stillGone = !(await this.isStillInRoom(bookingId, buyerUserId));
        if (stillGone) {
            await prisma_1.prisma.sessionBooking.update({
                where: { id: bookingId },
                data: { buyerLeftEarly: true },
            });
            await notification_service_1.NotificationService.notifyBuyerAbsenceGraceExpired(sellerUserId, bookingId);
        }
    }
    /**
     *
     * @param packageId
     */
    static async releaseFunds(pkg, tag, pct) {
        console.log(`[PAYOUT] Package ${pkg.id} eligible for ${tag} release: ${pct * 100} * ${pkg.totalAmount}`);
    }
    static async checkPackagePayoutMilestones(packageId) {
        try {
            const pkg = await prisma_1.prisma.sessionPackage.findUniqueOrThrow({
                where: { id: packageId },
                include: { bookings: true }
            });
            const total = pkg.bookings.length;
            const resolved = pkg.bookings.filter(b => b.outcome !== "PENDING" && b.outcome != "DISPUTED");
            const resolvedPct = resolved.length / total;
            const isLongPackage = total > 5;
            if (isLongPackage) {
                if (pkg.payoutStage === "NONE" && resolvedPct >= 1 / 3) {
                    await this.releaseFunds(pkg, "TIER1", 0.30);
                    await prisma_1.prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "TIER1_RELEASED", tierOneReleasedAt: new Date() }
                    });
                }
                if (pkg.payoutStage === "TIER1_RELEASED" && resolvedPct >= 2 / 3) {
                    await this.releaseFunds(pkg, "FINAL", 0.40);
                    await prisma_1.prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "TIER2_RELEASED", tierTwoReleasedAt: new Date() },
                    });
                }
                if (pkg.payoutStage === "TIER2_RELEASED" && resolvedPct >= 2 / 3) {
                    await this.releaseFunds(pkg, "FINAL", 0.30);
                    await prisma_1.prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "FULLY_RELEASED", finalReleasedAt: new Date() },
                    });
                }
            }
            else {
                // 50/50
                const midpoint = Math.ceil(total / 2);
                if (pkg.payoutStage === "NONE" && resolved.length >= midpoint) {
                    await this.releaseFunds(pkg, "MIDPOINT", 0.50);
                    await prisma_1.prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "TIER1_RELEASED", tierOneReleasedAt: new Date() },
                    });
                }
                if (pkg.payoutStage === "TIER1_RELEASED" && resolved.length === total) {
                    await this.releaseFunds(pkg, "FINAL", 0.50);
                    await prisma_1.prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "FULLY_RELEASED", finalReleasedAt: new Date() },
                    });
                }
            }
        }
        catch (err) {
            throw err;
        }
    }
    static async sweepOverdueSessions() {
        const cutoff = new Date(Date.now() - NO_SHOW_GRACE_MIN * 60_000);
        const overdue = await prisma_1.prisma.sessionBooking.findMany({
            where: {
                status: "SCHEDULED",
                scheduledStart: { lt: cutoff }
            },
            select: { id: true }
        });
        for (const booking of overdue) {
            try {
                await this.resolveSessionOutcome(booking.id);
            }
            catch (err) {
                console.error(`[SWEEP] failed to flag booking ${booking.id}:`, err); // no throw - continue 
            }
        }
        return { checked: overdue.length };
    }
}
exports.CallService = CallService;
