import { prisma } from "../utils/prisma";
import { onReviewCreated } from "./ranking/triggers"

export class ReviewService {
// 66fcb691-167b-42a1-851c-64968ee28053
    // POST /api/reviews
    static async submitReview(
        orderId: string,
        buyerId: string,
        rating: number,
        comment: string
    ): Promise<any> {
        // 1. Validate range 1-5
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            throw new Error("Rating must be a whole number between 1 and 5.");
        }

        if (!comment || comment.trim().length < 10) {
            throw new Error("Comment must be at least 10 characters");
        }

        // 2. Fetch order and confirm it's completed + belongs to this buyer
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { review: true }
        });

        if (!order) throw new Error("Order not found");
        if (order.status === "DISPUTED") {
            console.error("ORDER IS UNDER DISPUTE AND CANNOT BE MODIFIED UNTIL RESOLVED");
            throw new Error("This order is under dispute and cannot be modified until resolved.");
        }
        if (order.buyerId !== buyerId) throw new Error("Only the buyer of this order can leave a review");
        if (order.status !== "COMPLETED") throw new Error("You can only review a completed order.");
        if (order.review) throw new Error("You already reviewed this order.");
        

        // 3. Create a review + update gig and seller average atomically
        return await prisma.$transaction(async (tx) => {
            const review = await tx.review.create({
                data: {
                    orderId,
                    gigId: order.gigId,
                    buyerId,
                    sellerId: order.sellerId,
                    rating,
                    comment: comment.trim()
                }
            });

            // Recalculate gig average rating
            const gigStats = await tx.review.aggregate({
                where: { gigId: order.gigId, isPublic: true, isFlagged: false },
                _avg: { rating: true },
                _count: { id: true }
            });

            await tx.gig.update({
                where: { id: order.gigId },
                data: {
                    avgRating: gigStats._avg.rating ?? 0,
                    totalReviews: gigStats._count.id
                }
            });

            //Recalculate Seller average rating
            const sellerStats = await tx.review.aggregate({
                where: { sellerId: order.sellerId, isPublic: true, isFlagged: false },
                _avg: { rating: true },
                _count: { id: true }
            });

            await tx.sellerProfile.update({
                where: { id: order.sellerId },
                data: {
                    avgRating: sellerStats._avg.rating ?? 0,
                    totalReviews: sellerStats._count.id
                }
            });

            return review;
        }).then(async (review) => {
            // Fire-and-forget, outside the transaction — ranking recalculation
            // doesn't need to be atomic with the review write itself
            onReviewCreated(order.gigId).catch(err => 
                console.error(`Failed to trigger ranking recalculation for gig ${order.gigId}:`, err)
            );
            return review;
        });
    }

    // GET /api/gigs/:gigId/reviews
    static async getGigReviews(
        gigId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<any> {
        try {
            const skip = (page - 1) * limit;

            const [reviews, total] = await Promise.all([
                prisma.review.findMany({
                    where: { gigId, isPublic: true, isFlagged: false },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        buyer: {
                            select: { id: true, name: true } // profilePic later
                        }
                    }
                }),
                prisma.review.count({
                    where: { gigId, isPublic: true, isFlagged: false}
                })
            ]);

            return {
                data: reviews,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch(error: any) {
            throw new Error("ERROR IN FETCHING gig REVIEWS: ", error);
        }
    }

     // GET /api/gigs/:gigId/reviews
     static async getSellerReviews(
        sellerId: string,
        page: number = 1,
        limit: number = 20
    ): Promise<any> {
        try {
            const skip = (page - 1) * limit;

            const [reviews, total] = await Promise.all([
                prisma.review.findMany({
                    where: { sellerId, isPublic: true, isFlagged: false },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                    include: {
                        buyer: {
                            select: { id: true, name: true } // profilePic later
                        },
                        gig: { select: { title: true } }
                    }
                }),
                prisma.review.count({
                    where: { sellerId, isPublic: true, isFlagged: false}
                })
            ]);

            return {
                data: reviews,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch(error: any) {
            throw new Error("ERROR IN FETCHING seller REVIEWS: ", error);
        }
    }

}