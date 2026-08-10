"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const sessionMaterial_controller_1 = require("../controllers/sessionMaterial.controller");
const router = (0, express_1.Router)();
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
router.post("/:callSessionId/generate", auth_1.protectRoute, sessionMaterial_controller_1.SessionMaterialController.generateUploadUrl);
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
router.post("/:callSessionId", auth_1.protectRoute, sessionMaterial_controller_1.SessionMaterialController.saveMaterial);
router.get("/:callSessionId", auth_1.protectRoute, sessionMaterial_controller_1.SessionMaterialController.listMaterial);
exports.default = router;
