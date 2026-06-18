import { Router } from "express";
import { GigController } from "../controllers/gig.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/gig/create:
 *   post:
 *     summary: Seller creates a Gig
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, basePrice]
 *             properties:
 *               title:
 *                 type: string
 *                 default: "Logo Design"
 *               description:
 *                 type: string
 *                 default: "I will design a professional logo for your brand"
 *               basePrice:
 *                 type: number
 *                 default: 5000
 *               categoryId:
 *                 type: string
 *                 default: "design"
 *     responses:
 *       201:
 *         description: Gig created successfully
 *       400:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/create", protectRoute, GigController.createGig);

export default router;