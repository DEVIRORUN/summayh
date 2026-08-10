"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallService = void 0;
const livekit_server_sdk_1 = require("livekit-server-sdk");
const prisma_1 = require("../utils/prisma");
const notification_service_1 = require("./notification.service");
const roomService = new livekit_server_sdk_1.RoomServiceClient(process.env.LIVEKIT_URL, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
const JOIN_WINDOW_MIN = 5; // room is joinable by N mins before main session starts
const NO_SHOW_GRACE_MIN = 10; // The flag if nobody joins after N mins when session starts
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
            await prisma_1.prisma.callEvent.create({
                data: { sessionId: callSession.id, type: "JOINED", metadata: { userId } }
            });
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
    static async flagNoShow(bookingId) {
        const booking = await prisma_1.prisma.sessionBooking.findUniqueOrThrow({
            where: { id: bookingId },
            include: {
                callSession: { include: { events: true } }
            }
        });
        if (!booking.callSession || booking.callSession.status === "ACTIVE")
            return;
        const joinedUserIds = new Set(booking.callSession.events.filter(e => e.type === "JOINED").map(e => e.metadata?.userId));
        const order = (await prisma_1.prisma.order.findFirstOrThrow({
            where: { id: booking.callSession.orderId },
            include: { seller: true }
        }));
        const sellerUserId = order.seller.userId;
        const buyerUserId = order.buyerId;
        const sellerJoined = joinedUserIds.has(sellerUserId);
        const buyerJoined = joinedUserIds.has(buyerUserId);
        if (!sellerJoined)
            await notification_service_1.NotificationService.notifyNoShowRisk(sellerUserId, bookingId, 'SELLER');
        if (!buyerJoined)
            await notification_service_1.NotificationService.notifyNoShowRisk(buyerUserId, bookingId, 'BUYER');
        await prisma_1.prisma.sessionBooking.update({
            where: { id: bookingId },
            data: { status: "MISSED" },
        });
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
                await this.flagNoShow(booking.id);
            }
            catch (err) {
                console.error(`[SWEEP] failed to flag booking ${booking.id}:`, err); // no throw - continue 
            }
        }
        return { checked: overdue.length };
    }
}
exports.CallService = CallService;
