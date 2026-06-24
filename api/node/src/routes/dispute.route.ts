import { Router } from "express";
import { DisputeController } from "../controllers/dispute.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/disputes:
 *   post:
 *     summary: Buyer opens a dispute on an active or delivered order
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, reason, description]
 *             properties:
 *               orderId:
 *                 type: string
 *                 format: uuid
 *                 default: "PASTE_ORDER_UUID"
 *               reason:
 *                 type: string
 *                 enum: [WORK_NOT_DELIVERED, WORK_NOT_AS_DESCRIBED, SELLER_UNRESPONSIVE, QUALITY_ISSUES, OTHER]
 *                 default: "QUALITY_ISSUES"
 *               description:
 *                 type: string
 *                 default: "The delivered logo does not match the agreed minimalist style. Colours are wrong and the brand name is misspelled."
 *               evidenceUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: ["https://example.com/screenshot1.jpg"]
 *     responses:
 *       201:
 *         description: Dispute opened, order frozen
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", protectRoute, DisputeController.openDispute);

/**
 * @openapi
 * /api/disputes/{disputeId}:
 *   get:
 *     summary: Get a dispute by ID (buyer or seller only)
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dispute retrieved
 *       403:
 *         description: Not your dispute
 *       404:
 *         description: Dispute not found
 *       500:
 *         description: Server error
 */
router.get("/:disputeId", protectRoute, DisputeController.getDispute);

/**
 * @openapi
 * /api/disputes/{disputeId}/evidence:
 *   post:
 *     summary: Buyer or seller submits additional evidence
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
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
 *             required: [evidenceUrls]
 *             properties:
 *               evidenceUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 default: ["https://example.com/additional-evidence.jpg"]
 *     responses:
 *       200:
 *         description: Evidence added
 *       400:
 *         description: Validation error or dispute already closed
 *       500:
 *         description: Server error
 */
router.post("/:disputeId/evidence", protectRoute, DisputeController.submitEvidence);

/**
 * @openapi
 * /api/disputes/{disputeId}/resolve:
 *   post:
 *     summary: Admin resolves a dispute in favour of buyer or seller
 *     tags: [Disputes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: disputeId
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
 *             required: [winner, resolution]
 *             properties:
 *               winner:
 *                 type: string
 *                 enum: [buyer, seller]
 *                 default: "buyer"
 *               resolution:
 *                 type: string
 *                 default: "After reviewing evidence from both parties, the delivered work does not meet the agreed brief. Full refund issued to buyer."
 *     responses:
 *       200:
 *         description: Dispute resolved, funds moved accordingly
 *       400:
 *         description: Already resolved or payment error
 *       500:
 *         description: Server error
 */
router.post("/:disputeId/resolve", protectRoute, DisputeController.resolveDispute);

export default router;