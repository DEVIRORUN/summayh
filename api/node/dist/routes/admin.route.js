"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const isAdmin_1 = require("../middleware/isAdmin");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/admin/dashboard:
 *   get:
 *     summary: This lets the admin see some stats
 *     description: Fetches dynamic global marketplace metrics including total users, revenue, active gigs, and top sellers.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics loaded successfully.
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       403:
 *         description: Forbidden. Requires admin privileges.
 */
router.get("/dashboard", isAdmin_1.isAdmin, admin_controller_1.AdminController.getDashboard);
/**
 * @openapi
 * /api/admin/disputes:
 *   get:
 *     summary: Retrieve a paginated list of marketplace disputes
 *     description: Allows admins to browse user disputes with optional status filters.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to fetch.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *         description: Number of results per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, AI_REVIEWED, MANUAL_REVIEWED, RESOLVED_BUYER, RESOLVED_SELLER, CLOSED]
 *         description: Filter disputes by their current operational state.
 *     responses:
 *       200:
 *         description: Paginated disputes returned successfully.
 */
router.get("/disputes", isAdmin_1.isAdmin, admin_controller_1.AdminController.listDisputes);
/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Filter and browse through the entire platform user base
 *     description: Provides a queryable system to find specific users across universities or verification tiers.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 15
 *       - in: query
 *         name: verificationStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, VERIFIED, REJECTED, NOTVERIFIED]
 *         description: Filter users based on their ID verification status.
 *       - in: query
 *         name: university
 *         schema:
 *           type: string
 *         description: Filter users belonging to a specific institution.
 *     responses:
 *       200:
 *         description: User records directory fetched successfully.
 */
router.get("/users", isAdmin_1.isAdmin, admin_controller_1.AdminController.listUsers);
/**
 * @openapi
 * /api/admin/users/{userId}/verify:
 *   post:
 *     summary: Approve a user's verification submission
 *     description: Instantly changes a target user's status profile to VERIFIED.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier UUID of the user.
 *     responses:
 *       200:
 *         description: User profile successfully marked as verified.
 *       404:
 *         description: Target user not found.
 */
router.post("/users/:userId/verify", isAdmin_1.isAdmin, admin_controller_1.AdminController.verifyUser);
/**
 * @openapi
 * /api/admin/users/{userId}/suspend:
 *   post:
 *     summary: Permanently or temporarily suspend a user profile
 *     description: Bans the user account from the marketplace and drops active authentication token versions.
 *     tags:
 *       - Admin Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier UUID of the user to be banned.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Terms of Service violation. Multiple instances of unfulfilled orders."
 *     responses:
 *       200:
 *         description: User account flagged as banned and active sessions bricked.
 *       400:
 *         description: Bad request. Missing suspension reason in body payload.
 *       404:
 *         description: Target user not found.
 */
router.post("/users/:userId/suspend", isAdmin_1.isAdmin, admin_controller_1.AdminController.suspendUser);
exports.default = router;
