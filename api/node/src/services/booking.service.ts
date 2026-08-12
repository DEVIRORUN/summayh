import { callQueue } from "../utils/queue";
import { prisma } from "../utils/prisma";

export class BookingService {
    static async createBooking(data: { packageId?: string; enrollmentId?: string; scheduledStart: Date; scheduledEnd: Date; }) {
        const booking = await prisma.sessionBooking.create({ data });

        const joinWindowMs = 5 * 60_000;
        const noShowGraceMs = 10 * 60_000;
        const delayUntilPrep = booking.scheduledStart.getTime() - joinWindowMs - Date.now();
        const delayUntilNoShowCheck = booking.scheduledStart.getTime() + noShowGraceMs - Date.now();

        await callQueue.add(
            "prepare-room",
            { bookingId: booking.id },
            { 
                delay: Math.max(delayUntilPrep, 0), 
                jobId: `prepare-${booking.id}`,
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 }
            }
        );

        await callQueue.add(
            "flag-no-show",
            { bookingId: booking.id },
            { 
                delay: Math.max(delayUntilNoShowCheck, 0), 
                jobId: `noshow-${booking.id}`,
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 }
            }
        );

        return booking;
    }
}