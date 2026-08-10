"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
const prismaErrorHandler_1 = require("../utils/prismaErrorHandler");
class ReviewController {
    static async submitReview(req, res) {
        try {
            const buyerId = req.userId;
            const { orderId, rating, comment } = req.body;
            if (!orderId || !rating || !comment) {
                return res.status(400).json({
                    message: "orderId, rating, and comment are all required."
                });
            }
            const review = await review_service_1.ReviewService.submitReview(orderId, buyerId, rating, comment);
            return res.status(201).json({
                message: "SUBMITTED REVIEW SUCCESSFULLY",
                data: review
            });
        }
        catch (error) {
            console.error("ERROR SUBMITTING REVIEW: ", error);
            const knownMessages = [
                "Rating must be",
                "Comment must be",
                "Only the buyer",
                "You can only review",
                "You have already reviewed"
            ];
            if (knownMessages.some(m => error.message?.includes(m))) {
                return res.status(400).json({ message: error.message });
            }
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "ERROR SUBMITTING REVIEW" });
        }
    }
    static async getGigReviews(req, res) {
        try {
            const { gigId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await review_service_1.ReviewService.getGigReviews(gigId, page, limit);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("ERROR getting gig reviews:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
    static async getSellerReviews(req, res) {
        try {
            const { sellerId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await review_service_1.ReviewService.getSellerReviews(sellerId, page, limit);
            return res.status(200).json(result);
        }
        catch (error) {
            console.error("ERROR getting seller reviews:", error);
            const handled = (0, prismaErrorHandler_1.handlePrismaError)(error, res);
            if (handled)
                return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
}
exports.ReviewController = ReviewController;
