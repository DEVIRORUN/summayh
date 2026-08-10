"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialService = void 0;
const prisma_1 = require("../utils/prisma");
class TestimonialService {
    static async createTestimonial(data) {
        return await prisma_1.prisma.testimonial.create({
            data,
        });
    }
    static async getSellerTestimonials(userId) {
        console.log(new Date(), "-> [Testimonial]: Hit!");
        const seller = await prisma_1.prisma.sellerProfile.findUnique({
            where: { userId },
            select: {
                id: true,
            },
        });
        if (!seller) {
            throw new Error("Seller Profile not found");
        }
        return await prisma_1.prisma.testimonial.findMany({
            where: { sellerId: seller.id },
            include: {
                buyer: {
                    select: {
                        name: true,
                        email: true,
                        university: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
    }
}
exports.TestimonialService = TestimonialService;
