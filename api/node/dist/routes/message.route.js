"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/messages/conversation:
 *   post:
 *     summary: Get or create a conversation with another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otherUserId]
 *             properties:
 *               otherUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversation ready
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 */
router.post("/conversation", auth_1.protectRoute, message_controller_1.MessageController.getOrCreateConversation);
/**
 * @openapi
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations for the authenticated user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/conversations", auth_1.protectRoute, message_controller_1.MessageController.getConversations);
/**
 * @openapi
 * /api/messages/{conversationId}:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Messages retrieved
 *       403:
 *         description: Not a participant
 *       404:
 *         description: Conversation not found
 */
router.get("/:conversationId", auth_1.protectRoute, message_controller_1.MessageController.getMessages);
/**
 * @openapi
 * /api/messages/{conversationId}:
 *   post:
 *     summary: Send a message in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 *       400:
 *         description: Invalid request
 */
router.post("/:conversationId", auth_1.protectRoute, message_controller_1.MessageController.sendMessage);
/**
 * @openapi
 * /api/messages/{conversationId}/seen:
 *   patch:
 *     summary: Mark all messages in a conversation as seen
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as seen
 */
router.patch("/:conversationId/seen", auth_1.protectRoute, message_controller_1.MessageController.markAsSeen);
exports.default = router;
