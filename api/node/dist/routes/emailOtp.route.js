"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/emailOtp.route.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const emailOtp_controller_1 = require("../controllers/emailOtp.controller");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/email-otp/send:
 *   post:
 *     summary: Send a 6-digit OTP to the authenticated user's email
 *     tags: [Email OTP]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       500:
 *         description: Failed to send OTP
 */
router.post("/send", auth_1.protectRoute, emailOtp_controller_1.EmailOtpController.sendOtp);
/**
 * @openapi
 * /api/email-otp/verify:
 *   post:
 *     summary: Verify the email OTP entered by the user
 *     tags: [Email OTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "482193"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: OTP missing, invalid, expired, or already used
 *       500:
 *         description: Failed to verify OTP
 */
router.post("/verify", auth_1.protectRoute, emailOtp_controller_1.EmailOtpController.verifyOtp);
exports.default = router;
