import { prisma } from "../utils/prisma";
import { PaystackService } from "./paystack.service";

export class AdminService {
    static async getDashboardMetrics(adminId: string): Promise<any> {
        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });
        if (admin?.role !== "ADMIN") {
            throw new Error("You are not an admin!!!");
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [
            totalUsers,
            activeGigs,
            ordersThisMonth,
            revenueAggregate,
            openDisputes,
            topSellers
        ] = await Promise.all([
            prisma.user.count(),
            prisma.gig.count({ where: { state: "ACTIVE" } }),
            prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
            prisma.order.aggregate({
                where: { status: "COMPLETED" },
                _sum: { commission: true}
            }),
            prisma.dispute.count({ where: { status: "OPEN" } }),
            prisma.sellerProfile.findMany({
                take: 5,
                orderBy: [
                    { totalReviews: "desc" },
                    { avgRating: "desc" }
                ],
                select: {
                    id: true,
                    sellerUsername: true,
                    totalReviews: true,
                    avgRating: true,
                    user: { select: { name: true, email: true, phoneNumber: true } }
                }
            })
        ]);

        return {
            totalUsers,
            activeGigs,
            ordersThisMonth,
            totalRevenue: revenueAggregate._sum.commission || 0,
            openDisputes,
            top5sellers: topSellers.map(seller => ({
                id: seller.id,
                username: seller.sellerUsername,
                totalReviews: seller.totalReviews,
                avgRating: seller.avgRating,
                name: seller.user.name,
                email: seller.user.email,
                phoneNumber: seller.user.phoneNumber
            }))
        }
    }
    static async getPaginatedDisputes(page: number, limit: number, status?: string): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const whereClause: any = {};
            if (status) whereClause.status = status;

            const disputes = await prisma.dispute.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    order: { select: { id: true, totalPrice: true } },
                    buyer: { select: { id: true, name: true } },
                    seller: { select: { id: true, sellerUsername: true } },
                }
            });

            // Map through disputes to append AI strcutural evaluations if needed
            const disputesWithAI = disputes.map(dispute => ({
                ...dispute,
                aiRecommendation: `AI Assessment: Based on initial review, dispute raised by user requires contract timeline validaiton.`
            }));

            const total = await prisma.dispute.count({ where: whereClause });

            return {
                disputes: disputesWithAI,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch(error: any) {
            console.error("ERROR fetching paginated disputes");
            throw error;
        }
    }
    static async getAgentDecisions(agentName?: string, limit = 50) {
        return prisma.agentDecision.findMany({
            where: agentName ? { agentName: agentName as any } : undefined,
            orderBy: { createdAt: "desc" },
            take: limit,
        })
    }
    static async getPaginatedUsers(
        page: number = 1, 
        limit: number = 15,
        filters: { verificationStatus?: string; university?: string; dateFrom?: string }
    ): Promise<any> {
        try {
            const skip = (page - 1) * limit;
            const whereClause: any = {}

            if (filters.verificationStatus) whereClause.verificationStatus = filters.verificationStatus;
            if (filters.university) whereClause.university = filters.university;
            if (filters.dateFrom) {
                whereClause.createdAt = { gte: new Date(filters.dateFrom) };
            }

            const users = await prisma.user.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    university: true,
                    isBanned: true,
                    isPhoneVerified: true,
                    createdAt: true
                }
            });

            const total = await prisma.user.count({
                where: whereClause
            });

            return {
                users,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        } catch(error: any) {
            console.error("ERROR fetching paginated Users");
            throw error;
        }
    }
    static async verifyUserAccount(userId: string): Promise<any> {
        try {
            return await prisma.user.update({
                where: { id: userId },
                data: { verificationStatus: "VERIFIED" },
                select: { id: true, name: true, verificationStatus: true }
            });
        } catch(error: any) {
            console.error(`ERROR in verifying user ${userId} account`);
            throw error;
        }
    }
    static async suspendUserAccount(userId: string, reason: string): Promise<any> {
        try {
            return await prisma.user.update({
                where: { id: userId },
                data: { 
                    isBanned: true,
                    banReason: reason,
                    tokenVersion: { increment: 1 }// Instantly bricks current client tokens on verification checks
                },
                select: {
                    id: true,
                    name: true,
                    isBanned: true,
                    banReason: true,
                    tokenVersion: true
                }
            })
        } catch(error: any) {
            console.error("ERROR in suspending user account");
            throw error;
        }
    }
}