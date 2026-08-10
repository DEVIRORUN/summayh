"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/user/me:
 *  get:
 *     summary: get current authenticated user details
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: successfully listed the user details
 *       500:
 *         description: Failed to fetch user data
 *
 */
router.get("/me", auth_1.protectRoute, user_controller_1.UserController.getMe);
/**
 * @openapi
 * /api/user/update:
 *   put:
 *     summary: Update user's data
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Updated user username
 *               phoneNumber:
 *                 type: string
 *                 description: Updated user phone number
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid input data
 */
router.put("/update", auth_1.protectRoute, user_controller_1.UserController.updateMe);
exports.default = router;
