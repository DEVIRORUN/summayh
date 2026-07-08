
import { prisma } from "../utils/prisma";
import { TierLabel } from "../../generated/prisma"


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
}