// routes/emailOtp.route.ts
import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { otpLimiter } from "../middleware/rateLimit";
import { EmailOtpController } from "../controllers/emailOtp.controller";

const router = Router();

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
router.post("/send", protectRoute, otpLimiter, EmailOtpController.sendOtp);

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
router.post("/verify", protectRoute, otpLimiter, EmailOtpController.verifyOtp);

export default router;