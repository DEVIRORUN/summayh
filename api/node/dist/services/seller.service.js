"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SellerService = void 0;
const prisma_1 = require("../utils/prisma");
class SellerService {
    static async getSellerByUserId(userId) {
        try {
            const seller = await prisma_1.prisma.sellerProfile.findUnique({
                where: { userId },
                select: {
                    id: true,
                    userId: true,
                    sellerUsername: true,
                    bio: true,
                    skills: true,
                    phoneNumber: true,
                    rating: true,
                    totalReviews: true,
                }
            });
            if (!seller) {
                throw new Error("Seller not found");
            }
            // Lets list the gigs under this seller too
            const gigs = await prisma_1.prisma.gig.findMany({
                where: { sellerId: seller.id },
                select: {
                    id: true,
                    title: true,
                    service: true,
                    description: true,
                    sellerId: true,
                    avgRating: true,
                    totalReviews: true,
                }
            });
            return { ...seller, gigs };
        }
        catch (error) {
            console.error("ERROR fetching seller:", error);
            throw error;
        }
    }
    static async getSellerById(sellerId) {
        try {
            const seller = await prisma_1.prisma.sellerProfile.findUnique({
                where: { id: sellerId },
                select: {
                    id: true,
                    userId: true,
                    sellerUsername: true,
                    rating: true,
                    totalReviews: true,
                }
            });
            if (!seller) {
                throw new Error("Seller not found");
            }
            return seller;
        }
        catch (error) {
            console.error("ERROR fetching seller:", error);
            throw error;
        }
    }
    static async updateSellerProfile(sellerId, bio, skills, phoneNumber, sellerUsername) {
        try {
            // find seller first
            const seller = await prisma_1.prisma.sellerProfile.findUnique({
                where: { userId: sellerId },
            });
            if (!seller) {
                throw new Error("Seller not found");
            }
            // Dynamic build for fields
            const updatedFields = {};
            if (bio !== undefined)
                updatedFields.bio = bio;
            if (phoneNumber !== undefined)
                updatedFields.phoneNumber = phoneNumber;
            if (sellerUsername !== undefined)
                updatedFields.sellerUsername = sellerUsername;
            if (skills !== undefined) {
                const existingSkills = Array.isArray(seller.skills) ? seller.skills : [];
                const newSkills = Array.isArray(skills) ? skills : [skills];
                updatedFields.skills = Array.from(new Set([...existingSkills, ...newSkills]));
            }
            ;
            // Only call if there's actually a change brr
            if (Object.keys(updatedFields).length > 0) {
                const updatedSeller = await prisma_1.prisma.sellerProfile.update({
                    where: { userId: sellerId },
                    data: updatedFields,
                });
                if (!updatedSeller) {
                    throw new Error("Failed to update seller profile");
                }
            }
            return await prisma_1.prisma.sellerProfile.findUnique({
                where: { userId: sellerId },
                select: {
                    id: true,
                    userId: true,
                    sellerUsername: true,
                    avgRating: true,
                    bio: true,
                    skills: true,
                    phoneNumber: true,
                    totalReviews: true,
                }
            });
        }
        catch (error) {
            console.error("ERROR updating seller profile:", error);
            throw error;
        }
    }
    static async setSellerAvailability(sellerId, availability) {
        try {
            console.log("[SET SELLER AVAILABILITY]: Hit!!!");
            const seller = await prisma_1.prisma.sellerProfile.findUnique({ where: { id: sellerId } });
            if (!seller)
                throw new Error("Seller not found");
            const result = await prisma_1.prisma.$transaction(async (tx) => {
                await tx.sellerAvailability.deleteMany({ where: { sellerId } });
                if (availability.length > 0) {
                    await tx.sellerAvailability.createMany({
                        data: availability.map((block) => ({
                            sellerId,
                            dayOfWeek: block.dayOfWeek,
                            startTime: block.startTime,
                            endTime: block.endTime,
                        })),
                    });
                }
                return tx.sellerAvailability.findMany({ where: { sellerId } });
            });
            console.log("[SET SELLER AVAILABILITY]: Successful!!!");
            return result;
        }
        catch (err) {
            throw err;
        }
    }
    static async getAvailableSlots(sellerId, date, sessionLengthMin) {
        try {
            // Which day is this?
            const targetDate = new Date(date + "T00:00:00");
            const dayOfWeek = targetDate.getDay();
            // Now we get teh avaialable the seller's Got // Queried with dayOfWeek
            const availability = await prisma_1.prisma.sellerAvailability.findMany({
                where: { sellerId, dayOfWeek },
            });
            if (availability.length === 0)
                return [];
            // Midnight of chosen day
            const dayStart = new Date(targetDate);
            const dayEnd = new Date(targetDate);
            // Midnight of next day
            dayEnd.setDate(dayEnd.getDate() + 1);
            const existingBookings = await prisma_1.prisma.sessionBooking.findMany({
                where: {
                    status: { in: ["SCHEDULED"] },
                    scheduledStart: { gte: dayStart, lt: dayEnd },
                    package: { gigTier: { gig: { sellerId } } }
                },
                select: { scheduledStart: true, scheduledEnd: true }
            });
            const slots = [];
            const earliestBookable = new Date(Date.now() + 5 * 60_000); // 5-min buffer
            for (const block of availability) {
                // Boundary for seller availability
                const [startH, startM] = block.startTime.split(":").map(Number);
                const [endH, endM] = block.endTime.split(":").map(Number);
                let cursor = new Date(targetDate);
                cursor.setHours(startH, startM, 0, 0);
                const blockEnd = new Date(targetDate);
                blockEnd.setHours(endH, endM, 0, 0);
                while (cursor.getTime() + sessionLengthMin * 60000 <= blockEnd.getTime()) {
                    const slotStart = new Date(cursor);
                    const slotEnd = new Date(cursor.getTime() + sessionLengthMin * 60000);
                    const overlaps = existingBookings.some((b) => slotStart < b.scheduledEnd && slotEnd > b.scheduledStart);
                    if (!overlaps && slotStart > earliestBookable) { // skipping past slots
                        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
                    }
                    cursor = new Date(cursor.getTime() + sessionLengthMin * 60000);
                }
            }
            return slots;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.SellerService = SellerService;
