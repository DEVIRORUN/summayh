"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestimonialController = void 0;
const testmonial_service_1 = require("../services/testmonial.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class TestimonialController {
    static async createTestimonial(req, res) {
        try {
            const buyerId = req.userId;
            const { sellerId, reviewerTitle, text, rating } = req.body;
            if (!buyerId) {
                return res.status(401).json({ error: "Unauthorized." });
            }
            const response = await testmonial_service_1.TestimonialService.createTestimonial({
                sellerId,
                buyerId,
                reviewerTitle,
                text,
                rating: Number(rating),
            });
            return res.status(200).json({
                message: "Successfully created testimonial",
                response,
            });
        }
        catch (err) {
            const handler = (0, prismaErrorHandler_1.handlePrismaError)(res, err);
            if (handler)
                return;
            console.error(new Date(), "-> [Testimonial Controller Error]:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    static async getTestimonial(req, res) {
        try {
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ error: "Unauthorized." });
            }
            const testimonial = await testmonial_service_1.TestimonialService.getSellerTestimonials(userId);
            console.log(new Date(), "-> [Testimonial]: Fetched successfully");
            return res.status(200).json({
                message: "Fetched testimonial successfully",
                testimonial,
            });
        }
        catch (err) {
            const handler = (0, prismaErrorHandler_1.handlePrismaError)(res, err);
            if (handler)
                return;
            console.error(new Date(), "-> [Testimonial Fetching Controller Error]:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.TestimonialController = TestimonialController;
