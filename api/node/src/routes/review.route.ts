import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     summary: Buyer submits a review for a completed order
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, rating, comment]
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 default: "PASTE_COMPLETED_ORDER_UUID"
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 5
 *               comment:
 *                 type: string
 *                 minLength: 10
 *                 default: "Excellent work! The logo came out clean and exactly as described. Very professional."
 *     responses:
 *       201:
 *         description: Review submitted successfully
 *       400:
 *         description: Validation error (rating out of range, already reviewed, etc.)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", protectRoute, ReviewController.submitReview);

/**
 * @openapi
 * /api/reviews/gig/{gigId}:
 *   get:
 *     summary: Get all public reviews for a gig
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: gigId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/gig/:gigId", ReviewController.getGigReviews);

/**
 * @openapi
 * /api/reviews/seller/{sellerId}:
 *   get:
 *     summary: Get all public reviews for a seller
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       500:
 *         description: Server error
 */
router.get("/seller/:sellerId", ReviewController.getSellerReviews);

export default router;