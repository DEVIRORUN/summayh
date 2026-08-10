"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gig_controller_1 = require("../controllers/gig.controller");
const auth_1 = require("../middleware/auth");
const isSeller_1 = require("../middleware/isSeller");
const router = (0, express_1.Router)();
/* ==========================================================================
   1. STATIC & WIZARD START ROUTES (Must come before dynamic /:gigId)
   ========================================================================== */
/**
 * @openapi
 * /api/gig/draft:
 *   post:
 *     summary: Create a draft Gig (Step 1 - Basics)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             title: I will design a clean minimalist logo for your brand
 *             categoryId: 123e4567-e89b-12d3-a456-426614174000
 *             tags: [logo, branding, minimalist]
 *     responses:
 *       201:
 *         description: Draft Gig created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller account required
 *       500:
 *         description: Internal server error
 */
router.post("/draft", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.createDraftGig);
/**
 * @openapi
 * /api/gig/create:
 *   post:
 *     summary: Create a new Gig (All-in-one legacy route)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Gig created successfully
 */
// router.post("/create", protectRoute, requireSeller, GigController.createGig);
/**
 * @openapi
 * /api/gig/search:
 *   post:
 *     summary: Agentic AI-powered gig search using Gemini
 *     tags: [Gigs]
 *     responses:
 *       200:
 *         description: Search results with AI extraction metadata
 */
router.get("/search", gig_controller_1.GigController.searchGigs);
router.post("/search", gig_controller_1.GigController.searchGigs);
/**
 * @openapi
 * /api/gig/me:
 *   get:
 *     summary: Get all Gigs by the authenticated seller
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of seller gigs
 */
router.get("/me", auth_1.protectRoute, gig_controller_1.GigController.getAllGigsBySeller);
/**
 * @openapi
 * /api/gig:
 *   get:
 *     summary: Get all Gigs (Public Feed)
 *     tags: [Gigs]
 *     responses:
 *       200:
 *         description: List of gigs
 */
router.get("/", gig_controller_1.GigController.listGigs);
/* ==========================================================================
   2. DYNAMIC /:gigId ROUTES & WIZARD STEPS
   ========================================================================== */
/**
 * @openapi
 * /api/gig/{gigId}/description:
 *   patch:
 *     summary: Add description and FAQ to a draft Gig (Step 2)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Description and FAQ saved successfully
 */
router.patch("/:gigId/description", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.addDescToGig);
/**
 * @openapi
 * /api/gig/{gigId}/tiers:
 *   patch:
 *     summary: Add pricing tiers to a draft Gig (Step 3)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tiers saved successfully
 */
router.patch("/:gigId/tiers", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.addTierToGig);
/**
 * @openapi
 * /api/gig/{gigId}/requirements:
 *   patch:
 *     summary: Add requirement templates to a draft Gig (Step 4)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Requirement templates saved successfully
 */
router.patch("/:gigId/requirements", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.addQuestionsToGig);
/**
 * @openapi
 * /api/gig/{gigId}/upload-url:
 *   post:
 *     summary: Generate a presigned R2 upload URL for gallery media (Step 5)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Presigned upload URL generated
 */
router.post("/:gigId/upload-url", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.getUploadUrl);
/**
 * @openapi
 * /api/gig/{gigId}/gallery:
 *   patch:
 *     summary: Save gallery images and video to a draft Gig (Step 5)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gallery saved successfully
 */
router.patch("/:gigId/gallery", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.saveGalleryToGig);
/**
 * @openapi
 * /api/gig/{gigId}/publish:
 *   patch:
 *     summary: Publish a draft Gig (Step 6 - Final)
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gig published successfully
 */
router.patch("/:gigId/publish", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.publishGig);
/**
 * @openapi
 * /api/gig/{gigId}/tiers/{tierId}/bulk-pricing:
 *   post:
 *     summary: Seller adds or updates bulk quantity pricing bands for a specific tier
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bulk pricing updated
 */
router.post("/:gigId/tiers/:tierId/bulk-pricing", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.addBulkPricing);
/**
 * @openapi
 * /api/gig/{gigId}/tiers/{tierId}/bulk-pricing:
 *   get:
 *     summary: User gets bulk quantity pricing bands for a specific tier
 *     tags: [Gigs]
 *     responses:
 *       200:
 *         description: Fetched Bulk pricing
 */
router.get("/:gigId/tiers/:tierId/bulk-pricing", gig_controller_1.GigController.getBulkPricing);
/**
 * @openapi
 * /api/gig/{gigId}:
 *   patch:
 *     summary: Update an existing Gig
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gig updated successfully
 */
router.patch("/:gigId", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.updateGig);
/**
 * @openapi
 * /api/gig/{gigId}:
 *   delete:
 *     summary: Delete a Gig
 *     tags: [Gigs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Gig deleted successfully
 */
router.delete("/:gigId", auth_1.protectRoute, isSeller_1.requireSeller, gig_controller_1.GigController.deleteGig);
/**
 * @openapi
 * /api/gig/{gigId}:
 *   get:
 *     summary: Get a single Gig
 *     tags: [Gigs]
 *     responses:
 *       200:
 *         description: Gig retrieved successfully
 */
router.get("/:gigId", gig_controller_1.GigController.readGig);
/* ==========================================================================
   3. EXPORT ROUTER AT THE VERY END
   ========================================================================== */
exports.default = router;
