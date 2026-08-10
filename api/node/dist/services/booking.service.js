"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const queue_1 = require("../utils/queue");
const prisma_1 = require("../utils/prisma");
class BookingService {
    static async createBooking(data) {
        const booking = await prisma_1.prisma.sessionBooking.create({ data });
        const joinWindowMs = 5 * 60_000;
        const noShowGraceMs = 10 * 60_000;
        const delayUntilPrep = booking.scheduledStart.getTime() - joinWindowMs - Date.now();
        const delayUntilNoShowCheck = booking.scheduledStart.getTime() + noShowGraceMs - Date.now();
        await queue_1.callQueue.add("prepare-room", { bookingId: booking.id }, {
            delay: Math.max(delayUntilPrep, 0),
            jobId: `prepare-${booking.id}`,
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 }
        });
        await queue_1.callQueue.add("flag-no-show", { bookingId: booking.id }, {
            delay: Math.max(delayUntilNoShowCheck, 0),
            jobId: `noshow-${booking.id}`,
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 }
        });
        await queue_1.callQueue.upsertJobScheduler("sweep-overdue-sessions", { every: 5 * 60_000 }, {
            name: "sweep-overdue-sessions",
            data: {},
        });
        return booking;
    }
}
exports.BookingService = BookingService;
