import { ProSource } from "../../generated/prisma";
import { prisma } from "../utils/prisma";


export class UserService {
    static async getMe(userId: string): Promise<any> {
        console.log("[getMe HIT !!!]")
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    username: true,
                    email: true,
                    university: true,
                    isPhoneVerified: true,
                    phoneNumber: true,
                    role: true,
                    createdAt: true,
                    sellerProfile: {
                        select: {
                            isPro: true,
                            founderBadge: true,
                            proSource: true
                        }
                    }
                }
            })

            if (!user) {
                console.error("User not found for ID:", userId);
                throw new Error("User not found!");
            }

            const { sellerProfile, ...rest } = user;

            return {
                ...rest,
                phoneNumber: user.isPhoneVerified ? user.phoneNumber : null,
                isPro: sellerProfile ? sellerProfile.isPro : false,
                founderBadge: sellerProfile ? sellerProfile.founderBadge : false,
                proSource: sellerProfile ? sellerProfile.proSource : null,
            };
        } catch(error: any) {
            console.error("ERROR fetching user: ", error);
            throw error;
        }
    }
    static async updateMe(userId: string, userData: any): Promise<any> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                console.error("User not found for ID:", userId);
                throw new Error("User not found!");
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: userData
            });

            return {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                phoneNumber: updatedUser.isPhoneVerified ? updatedUser.phoneNumber : null,
                school: updatedUser.university
            };
        } catch(error: any) {
            console.error("ERROR updating user: ", error);
            throw error;

        }
    }
}