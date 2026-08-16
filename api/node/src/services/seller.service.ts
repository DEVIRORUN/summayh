
import { prisma } from "../utils/prisma";
import { TierLabel } from "../../generated/prisma"

interface AvailabilityBlockInput {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export class SellerService {
    static async getSellerByUserId(userId: string): Promise<any> {
        try {
            const seller = await prisma.sellerProfile.findUnique({
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
            })

            if (!seller) {
                throw new Error("Seller not found");
            }
            // Lets list the gigs under this seller too
            const gigs = await prisma.gig.findMany({
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
            })

            return { ...seller, gigs };
        } catch (error) {
            console.error("ERROR fetching seller:", error);
            throw error;
        }
    }
    static async getSellerById(sellerId: string): Promise<any> {
        try {
            const seller = await prisma.sellerProfile.findUnique({
                where: { id: sellerId },
                select: {
                    id: true,
                    userId: true,
                    sellerUsername: true,
                    rating: true,
                    totalReviews: true,
                }
            })

            if (!seller) {
                throw new Error("Seller not found");
            }
            
            return seller;
        }   catch (error) {
            console.error("ERROR fetching seller:", error);
            throw error;
        }
    }
    static async updateSellerProfile(
        sellerId: string,
        bio?: string,
        skills?: string,
        phoneNumber?: string,
        sellerUsername?: string
): Promise<any> {
        try {
            // find seller first
            const seller = await prisma.sellerProfile.findUnique({
                where: { userId: sellerId},
            });

            if(!seller) {
                throw new Error("Seller not found");
            }

            // Dynamic build for fields
            const updatedFields: any = {};
            if (bio !== undefined) updatedFields.bio = bio;
            if (phoneNumber !== undefined) updatedFields.phoneNumber = phoneNumber;
            if (sellerUsername !== undefined) updatedFields.sellerUsername = sellerUsername;
            if (skills !== undefined) {
                const existingSkills = Array.isArray(seller.skills) ? seller.skills: [];
                const newSkills = Array.isArray(skills) ? skills : [skills];

                updatedFields.skills = Array.from(new Set([...existingSkills, ...newSkills]))
            };

            // Only call if there's actually a change brr
            if (Object.keys(updatedFields).length > 0) {
                const updatedSeller = await prisma.sellerProfile.update({
                    where: { userId: sellerId },
                    data: updatedFields,
                });

                if (!updatedSeller) {
                    throw new Error("Failed to update seller profile");
                }
            }
            return await prisma.sellerProfile.findUnique({
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
        } catch (error) {
            console.error("ERROR updating seller profile:", error);
            throw error;
        }
    }
    static async setSellerAvailability(
        sellerId: string, 
        availability: AvailabilityBlockInput[]
    ): Promise<any> {
        try {
            console.log("[SET SELLER AVAILABILITY]: Hit!!!");
            const seller = await prisma.sellerProfile.findUnique({ where: { id: sellerId } });
            if (!seller) throw new Error("Seller not found");

            const result = await prisma.$transaction(async (tx) => {
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

                return tx.sellerAvailability.findMany({ where: { sellerId } })
            })
            
            console.log("[SET SELLER AVAILABILITY]: Successful!!!");
            return result;
        } catch (err) {
            throw err;
        }
    }
    static async getAvailableSlots(
        sellerId: string,
        date: string,
        sessionLengthMin: number,
    ): Promise<{ start: string; end: string }[]> {
        try {
        // Which day is this?
        const targetDate = new Date(date + "T00:00:00");
        const dayOfWeek = targetDate.getDay();

        // Now we get the avaialable the seller's Got // Queried with dayOfWeek
        const availability = await prisma.sellerAvailability.findMany({
            where: { sellerId, dayOfWeek },
        })
        if (availability.length === 0) return [];

        // Midnight of chosen day
        const dayStart = new Date(targetDate);
        const dayEnd = new Date(targetDate);
        // Midnight of next day
        dayEnd.setDate(dayEnd.getDate() + 1);

        const existingBookings = await prisma.sessionBooking.findMany({
            where: {
            status: { in: ["SCHEDULED"] },
            scheduledStart: { gte: dayStart, lt: dayEnd },
            package: { gigTier: { gig: { sellerId } } }
            },
            select: { scheduledStart: true, scheduledEnd: true }
        })

        const slots: { start: string; end: string }[] = [];
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

            const overlaps = existingBookings.some(
                (b) => slotStart < b.scheduledEnd && slotEnd > b.scheduledStart,
            );

            if (!overlaps && slotStart > earliestBookable) { // skipping past slots
                slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() })
            }

            cursor = new Date(cursor.getTime() + sessionLengthMin * 60000);
            }
        }

        return slots;
        } catch (error: any) {
        throw error;
        }
    } 
    static async getPublicSellerProfile(identifier: string): Promise<any> {
    const sellerProfile = await prisma.sellerProfile.findFirst({
        where: {
            OR: [
                { sellerUsername: identifier },
                { user: { username: identifier } },
            ],
        },
        include: {
            user: {
                select: {
                    name: true,
                    username: true,
                    university: true,
                    role: true,
                },
            },
            gigs: {
                where: { state: "ACTIVE" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    coverImage: true,
                    avgRating: true,
                    totalReviews: true,
                    tiers: { select: { price: true }, orderBy: { price: "asc" }, take: 1 },
                },
            },
        },
    });

    if (!sellerProfile) throw new Error("Seller not found");

    return sellerProfile;
}
}