import { Router } from "express";
import { GigController } from "../controllers/gig.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/gig/create:
 *   post:
 *     summary: Create a new Gig
 *     description: Seller creates a Gig containing Basic, Standard and Premium tiers.
 *     tags:
 *       - Gigs
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateGig'
 *
 *           example:
 *             title: I will design a clean minimalist logo for your brand
 *             description: Professional logo design tailored for student startups and small businesses.
 *
 *             tags:
 *               - logo
 *               - branding
 *               - minimalist
 *               - design
 *
 *             categoryId: 123e4567-e89b-12d3-a456-426614174000
 *
 *             tiers:
 *               basic:
 *                 description: 1 logo concept
 *                 price: 5000
 *                 deliveryDays: 2
 *                 revisionCount: 1
 *
 *               standard:
 *                 customName: Brand Starter
 *                 description: 3 logo concepts
 *                 price: 12000
 *                 deliveryDays: 4
 *                 revisionCount: 3
 *
 *               premium:
 *                 customName: Full Brand Kit
 *                 description: 5 logo concepts
 *                 price: 25000
 *                 deliveryDays: 7
 *                 revisionCount: 5
 *
 *     responses:
 *       201:
 *         description: Gig created successfully
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Category or seller not found
 *
 *       500:
 *         description: Internal server error
 */
router.post("/create", protectRoute, GigController.createGig);
/**
 * @openapi
 * /api/gig/{gigId}:
 *   put:
 *     summary: Update an existing Gig
 *
 *     tags:
 *       - Gigs
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: gigId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Gig ID
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateGig'
 *
 *     responses:
 *       200:
 *         description: Gig updated successfully
 *
 *       400:
 *         description: Invalid request
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Gig not found
 *
 *       500:
 *         description: Internal server error
 */
router.patch("/update", protectRoute, GigController.updateGig);
/**
 * @openapi
 * /api/gig:
 *   get:
 *     summary: Get all Gigs
 *
 *     tags:
 *       - Gigs
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: List of gigs
 *
 *       500:
 *         description: Internal server error
 */
router.get("/", GigController.listGigs);
/**
 * @openapi
 * /api/gig/me:
 *   get:
 *     summary: Get all Gigs by the authenticated seller
 *
 *     tags:
 *       - Gigs
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: List of gigs
 *
 *       500:
 *         description: Internal server error
 */
router.get("/me", protectRoute, GigController.getAllGigsBySeller);
/**
 * @openapi
 * /api/gig/{gigId}:
 *   delete:
 *     summary: Delete a Gig
 *
 *     tags:
 *       - Gigs
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: gigId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Gig deleted successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Gig not found
 *
 *       500:
 *         description: Internal server error
 */
router.delete("/delete", protectRoute, GigController.deleteGig);
/**
 * @openapi
 * /api/gig/search:
 *   post:
 *     summary: Agentic AI-powered gig search using Gemini
 *     tags: [Gigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 default: "someone to bake a birthday cake in Ogbomoso"
 *               budgetMax:
 *                 type: number
 *                 default: 10000
 *               location:
 *                 type: string
 *                 default: "Ogbomoso"
 *               gigType:
 *                 type: string
 *                 enum: [DIGITAL, PHYSICAL]
 *     responses:
 *       200:
 *         description: Search results with AI extraction metadata
 *       500:
 *         description: Server error
 */
router.post("/search", GigController.searchGigs);
export default router;
/**
 * @openapi
 * /api/gig/{gigId}/tiers/{tierId}/bulk-pricing:
 *   post:
 *     summary: Seller adds or updates bulk quantity pricing bands for a specific tier
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gigId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: tierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bands]
 *             properties:
 *               bands:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     quantity:
 *                       type: integer
 *                       minimum: 2
 *                       example: 5
 *                     totalPrice:
 *                       type: number
 *                       example: 10000
 *           example:
 *             bands:
 *               - quantity: 5
 *                 totalPrice: 10000
 *               - quantity: 10
 *                 totalPrice: 18000
 *               - quantity: 15
 *                 totalPrice: 25000
 *     responses:
 *       200:
 *         description: Bulk pricing updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:gigId/tiers/:tierId/bulk-pricing", protectRoute, GigController.addBulkPricing);
/**
 * @openapi
 * /api/gig/{gigId}/tiers/{tierId}/bulk-pricing:
 *   get:
 *     summary: User gets bulk quantity pricing bands for a specific tier
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gigId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: tierId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: fetched Bulk pricing
 *       404:
 *         description: Bulk pricing not found
 *       500:
 *         description: Server error
 */
router.get("/:gigId/tiers/:tierId/bulk-pricing", GigController.getBulkPricing); // Not protected so anyone include visitors can see the bulk pricing for a tier
/**
 * @openapi
 * /api/gig/{gigId}:
 *   get:
 *     summary: Get a single Gig
 *
 *     tags:
 *       - Gigs
 *
 *     parameters:
 *       - in: path
 *         name: gigId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Gig retrieved successfully
 *
 *       404:
 *         description: Gig not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/:gigId", GigController.readGig);