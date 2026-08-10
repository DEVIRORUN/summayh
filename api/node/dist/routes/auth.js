"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// api/node/src/routes/auth.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../controllers/auth");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, dateOfBirth, phoneNumber]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *               name: { type: string }
 *               dateOfBirth: { type: string }
 *               phoneNumber: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post("/register", auth_2.registerUser);
/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, default: "seyiadebayo@lautech.edu.ng" }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", auth_2.loginUser);
/**
 * @openapi
 * /api/auth/check-email:
 *   post:
 *     summary: Check if email is a valid/registered .edu.ng email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Email check result
 */
router.post("/check-email", auth_2.checkEduEmail);
/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *       401:
 *         description: Unauthorized
 */
router.get("/me", auth_1.protectRoute, auth_2.getMe);
/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh the access token using a valid refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 *     responses:
 *       200:
 *         description: New access token issued
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", auth_2.refreshAccessToken);
/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", auth_1.protectRoute, auth_2.logoutUser);
exports.default = router;
