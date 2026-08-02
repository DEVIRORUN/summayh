import { Router } from "express";
import { TestimonialController } from "../controllers/testimonial.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/testimonial:
 *   post:
 *     summary: Create a new testimonial for a seller
 *     description: Allows authenticated buyers to write a recommendation and star rating for a specific seller.
 *     tags:
 *       - Testimonial Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sellerId
 *               - text
 *               - rating
 *             properties:
 *               sellerId:
 *                 type: string
 *                 description: The unique ID of the seller receiving the review.
 *               reviewerTitle:
 *                 type: string
 *                 description: Optional relationship tag (e.g., "Class Rep").
 *               text:
 *                 type: string
 *                 description: The written feedback message.
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Star rating from 1 to 5.
 *     responses:
 *       201:
 *         description: Testimonial posted successfully.
 *       400:
 *         description: Missing fields, or attempting a self-review.
 *       401:
 *         description: Unauthorized. User must be logged in.
 */
router.post("/", protectRoute, TestimonialController.createTestimonial);

/**
 * @openapi
 * /api/testimonial/{sellerId}:
 *   get:
 *     summary: Retrieve testimonials for a specific seller
 *     description: Fetches a public list of authenticated recommendations and scores written for a student builder.
 *     tags:
 *       - Testimonial Management
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the seller whose reviews you want to fetch.
 *     responses:
 *       200:
 *         description: List of testimonials returned successfully.
 *       500:
 *         description: Internal server error.
 */
router.get("/:sellerId", TestimonialController.getTestimonial); // Removed protectRoute so it's public!

export default router;