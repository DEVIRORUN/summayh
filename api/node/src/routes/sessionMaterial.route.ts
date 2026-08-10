import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { SessionMaterialController } from "../controllers/sessionMaterial.controller";

const router = Router();

/**
 * @openapi
 * /api/session-material/{callSessionId}/generate:
 *   post:
 *     summary: Generate a presigned upload URL for a session material file
 *     tags: [SessionMaterial]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: callSessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileType:
 *                 type: string
 *               fileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Upload URL generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:callSessionId/generate", protectRoute, SessionMaterialController.generateUploadUrl);

/**
 * @openapi
 * /api/session-material/{callSessionId}:
 *   post:
 *     summary: Save a session material record after upload
 *     tags: [SessionMaterial]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Material saved successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: List all materials for a call session
 *     tags: [Session Material]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Materials fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/:callSessionId", protectRoute, SessionMaterialController.saveMaterial);
router.get("/:callSessionId", protectRoute, SessionMaterialController.listMaterial);

export default router;