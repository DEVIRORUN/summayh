import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import { randomUUID } from "crypto";
import { prisma } from "../utils/prisma";
import { TermiiService } from "./termii.service";
import { NotificationService } from "./notification.service"
import { PresenceService } from "./presence.service"
import { SessionOutcome } from "../../generated/prisma";


const roomService  = new RoomServiceClient(
    process.env.LIVEKIT_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
);

const JOIN_WINDOW_MIN = 5; // room is joinable by N mins before main session starts
const NO_SHOW_GRACE_MIN = 10; // The flag if nobody joins after N mins when session starts

export class CallService {
    static async prepareSessionRoom(bookingId: string) {
        try {
            const booking = await prisma.sessionBooking.findUniqueOrThrow({
                where: { id: bookingId },
                include: { 
                    callSession: true,
                    package: { include: { order: { include: { seller: true } } } } ,
                    enrollment: { include: { order: { include: { seller: true } } } } ,
                }
            });

            if (booking.callSession) return booking.callSession; // Alreday prepared, idempotent

            const order = booking.package?.order ?? booking.enrollment?.order;
            if (!order) {
                throw new Error(
                    `SessionBooking ${bookingId} has no linked package or enrollment - cannot resulve buyer/seller`
                );
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

            const callSession = await prisma.$transaction(async (tx) => {
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
        } catch (err: any) {
            if(err.code === "P2002") {
                const existing = await prisma.sessionBooking.findUnique({
                    where: { id: bookingId },
                    include: { callSession: true }
                });
                if (existing?.callSession) return existing.callSession;
            }
            throw err;
        }
    }
    static async joinSession(bookingId: string, userId: string) {
        try {

            console.log("[JOIN SESSION]: JOINED INTRO");
            const booking = await prisma.sessionBooking.findFirstOrThrow({
                where: { id: bookingId },
                include: {
                    callSession: true,
                    package: { include: { order: { include: { seller: true } } } },
                    enrollment: { include: { order: { include: { seller: true } } } },
                }
            });
    
            const order = booking.package?.order ?? booking.enrollment?.order;
    
            if (!order) {
                throw new Error(`SessionBooking ${bookingId} has no linked enrollment or package`)
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
    
            await prisma.callEvent.create({
                data: { sessionId: callSession.id, type: "JOINED", metadata: { userId } }
            });
    
            if (callSession.status === "PENDING") {
                await prisma.callSession.update({
                    where: { id: callSession.id },
                    data: { status: "RINGING" },
                });
            }
    
            const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
                identity: userId,
                ttl: "10m"
            });
            at.addGrant({ roomJoin: true, room: callSession.roomName, canPublish: true, canSubscribe: true });
    
            console.log("[JOIN SESSION]: JOINED SUCCESFULLY");
            return { token: await at.toJwt(), url: process.env.LIVEKIT_URL, sessionId: callSession.id };
        } catch (err: any) {
            console.log("Failed to Join Session:", err)
            throw err;
        }
    }
    static async getBookingDetails(bookingId: string, userId: string) {
        try {
            const booking = await prisma.sessionBooking.findUnique({
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

            if (!booking) throw new Error("Booking Session not found!");

            const order = booking.package?.order ?? booking.enrollment?.order;
            if (!order) {
                throw new Error(`SessionBooking ${bookingId} has no linked enrollment or package`);
            }

            if (userId !== order.buyerId && userId !== order.seller.userId) {
                throw new Error("FORBIDDEN");
            }

            return booking
        } catch (err) {
            throw err;
        }
    }
    static async resolveSessionOutcome(bookingId: string) {
        const booking = await prisma.sessionBooking.findUniqueOrThrow({
            where: { id: bookingId },
            include: { 
                callSession: { include: { events: true } },
                package: { include: { order: { include: { seller: true } } } },
                enrollment: { include: { order: { include: { seller: true } } } },
            },
        });

        if (booking.outcome !== "PENDING") return;

        const events = booking.callSession?.events ?? [];
        const joinedUserIds = new Set(
            events.filter(e => e.type === "JOINED").map(e => (e.metadata as any)?.userId)
        )

        const order = booking.package?.order ?? booking.enrollment?.order;
        if (!order) {
            console.error(`[RESOLVE OUTCOME] booking ${bookingId} has no linked order.`);
            return;
        }

        const sellerUserId = order!.seller.userId;
        const buyerUserId = order!.buyerId;
        const sellerJoined = joinedUserIds.has(sellerUserId)
        const buyerJoined = joinedUserIds.has(buyerUserId)

        let outcome: SessionOutcome;
        if (booking.buyerJoinedAt && booking.sellerJoinedAt) {
            outcome = "DONE";
        } else if (booking.sellerJoinedAt && !booking.buyerJoinedAt) {
            outcome = "BUYER_MISSED"
        } else if (booking.buyerJoinedAt && !booking.sellerJoinedAt) {
            outcome = "SELLER_MISSED"
        } else  {
            outcome = "BOTH_MISSED"
        }

        await prisma.sessionBooking.update({
            where: { id: bookingId },
            data: {
                outcome,
                status: "COMPLETED",
                outcomeResolvedAt: new Date(),
            },
        });

        if (!sellerJoined) await NotificationService.notifyNoShowRisk(sellerUserId, bookingId, "SELLER");
        if (!buyerJoined) await NotificationService.notifyNoShowRisk(buyerUserId, bookingId, "BUYER");

        const bookingWithPackage = await prisma.sessionBooking.findUnique({ where: { id: bookingId } });
        if (bookingWithPackage?.packageId) {
            await this.checkPackagePayoutMilestones(bookingWithPackage.packageId);
        }
    }

    /**
     * 
     * @param packageId 
     */
    static async releaseFunds(pkg: any, tag: string, pct: number) {
        console.log(`[PAYOUT] Package ${pkg.id} eligible for ${tag} release: ${pct * 100} * ${pkg.totalAmount}`)
    }
    static async checkPackagePayoutMilestones(packageId: string) {
        try {
            const pkg = await prisma.sessionPackage.findUniqueOrThrow({
                where: { id: packageId },
                include: { bookings: true }
            });

            const total = pkg.bookings.length;
            const resolved = pkg.bookings.filter(b => 
                b.outcome !== "PENDING" && b.outcome != "DISPUTED"
            );
            const resolvedPct = resolved.length / total;

            const isLongPackage = total > 5;

            if (isLongPackage) {
                if (pkg.payoutStage === "NONE" && resolvedPct >= 1/3) {
                    await this.releaseFunds(pkg, "TIER1", 0.30);
                    await prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "TIER1_RELEASED", tierOneReleasedAt: new Date() }
                    });
                }

                if (pkg.payoutStage === "TIER1_RELEASED"  && resolvedPct >= 2/3) {
                    await this.releaseFunds(pkg, "FINAL", 0.40);
                    await prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "TIER2_RELEASED", tierTwoReleasedAt: new Date() },
                    })
                }
                if (pkg.payoutStage === "TIER2_RELEASED"  && resolvedPct >= 2/3) {
                    await this.releaseFunds(pkg, "FINAL", 0.30);
                    await prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "FULLY_RELEASED", finalReleasedAt: new Date() },
                    })
                }
            } else {
                // 50/50
                const midpoint = Math.ceil(total / 2);
                if (pkg.payoutStage === "NONE"  && resolved.length >= midpoint) {
                    await this.releaseFunds(pkg, "MIDPOINT", 0.50);
                    await prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "TIER1_RELEASED", tierOneReleasedAt: new Date() },
                    })
                }
                if (pkg.payoutStage === "TIER1_RELEASED"  && resolved.length === total) {
                    await this.releaseFunds(pkg, "FINAL", 0.50);
                    await prisma.sessionPackage.update({
                        where: { id: packageId },
                        data: { payoutStage: "FULLY_RELEASED", finalReleasedAt: new Date() },
                    })
                }
            }

        } catch (err) {
            throw err;
        }
    }
    static async sweepOverdueSessions() {
        const cutoff = new Date(Date.now() - NO_SHOW_GRACE_MIN * 60_000);

        const overdue = await prisma.sessionBooking.findMany({
            where: {
                status: "SCHEDULED",
                scheduledStart: { lt: cutoff }
            },
            select: { id: true }
        });

        for (const booking of overdue) {
            try {
                await this.resolveSessionOutcome(booking.id)
            } catch (err) {
                console.error(`[SWEEP] failed to flag booking ${booking.id}:`, err); // no throw - continue 
            }
        }
        return { checked: overdue.length };
    }

}