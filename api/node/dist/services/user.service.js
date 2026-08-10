"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../utils/prisma");
class UserService {
    static async getMe(userId) {
        console.log(new Date(), "-> [getMe HIT !!!]");
        try {
            const user = await prisma_1.prisma.user.findUnique({
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
                            proSource: true,
                        },
                    },
                },
            });
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
        }
        catch (error) {
            console.error("ERROR fetching user: ", error);
            throw error;
        }
    }
    static async updateMe(userId, userData) {
        try {
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                console.error("User not found for ID:", userId);
                throw new Error("User not found!");
            }
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: userId },
                data: userData,
            });
            return {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                phoneNumber: updatedUser.isPhoneVerified
                    ? updatedUser.phoneNumber
                    : null,
                school: updatedUser.university,
            };
        }
        catch (error) {
            console.error("ERROR updating user: ", error);
            throw error;
        }
    }
}
exports.UserService = UserService;
