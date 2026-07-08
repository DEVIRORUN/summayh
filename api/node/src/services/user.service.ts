import { prisma } from "../utils/prisma";


export class UserService {
    static async getMe(userId: string): Promise<any> {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            })

            if (!user) {
                console.error("User not found for ID:", userId);
                throw new Error("User not found!");
            }

            return {
                id: user.id,
                username: user.username,
                role: user.role,
                phoneNumber: user.isPhoneVerified ? user.phoneNumber : null,
                school: user.university
            }
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