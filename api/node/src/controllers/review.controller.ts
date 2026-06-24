import { Request, Response } from "express"
import { ReviewService } from "../services/review.service"
import { handlePrismaError } from "../utils/prismaErrorHandler"


export class ReviewController {

    static async submitReview(req: Request, res: Response): Promise<any> {
        try {
            const buyerId = (req as any).userId;
            const { orderId, rating, comment } = req.body;

            if (!orderId || !rating || !comment) {
                return res.status(400).json({
                    message: "orderId, rating, and comment are all required."
                });
            }

            const review = await ReviewService.submitReview(orderId, buyerId, rating, comment);

            return res.status(201).json({
                message: "SUBMITTED REVIEW SUCCESSFULLY",
                data: review
            });
        } catch(error: any) {
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

            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "ERROR SUBMITTING REVIEW" })
        }
    }

    static async getGigReviews(req: Request, res: Response): Promise<any> {
        try {
            const { gigId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await ReviewService.getGigReviews(gigId as string, page, limit);

            return res.status(200).json(result)
        } catch (error: any) {
            console.error("ERROR getting gig reviews:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }

    static async getSellerReviews(req: Request, res: Response): Promise<any> {
        try {
            const { sellerId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;

            const result = await ReviewService.getSellerReviews(sellerId as string, page, limit);

            return res.status(200).json(result)
        } catch (error: any) {
            console.error("ERROR getting seller reviews:", error);
            const handled = handlePrismaError(error, res);
            if (handled) return;
            return res.status(500).json({ message: "Something went wrong." });
        }
    }
}