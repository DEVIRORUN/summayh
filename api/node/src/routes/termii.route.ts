import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { TermiiController } from "../controllers/termii.controller";

const router = Router();

/**
 * @openapi
 * /api/otp/send:
 *   post:
 *     summary: Send a 6-digit OTP to the authenticated user's phone for verification
 *     tags: [OTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "+2348012345678"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Phone number missing
 *       500:
 *         description: Failed to send OTP
 */
router.post("/send", protectRoute, TermiiController.sendOtp);

/**
 * @openapi
 * /api/otp/verify:
 *   post:
 *     summary: Verify the OTP entered by the user
 *     tags: [OTP]
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
 *         description: Phone verified successfully
 *       400:
 *         description: Invalid, expired, or already-used OTP
 *       500:
 *         description: Failed to verify OTP
 */
router.post("/verify", protectRoute, TermiiController.verifyOtp);

/**
 * @openapi
 * /api/otp/notify/order-placed:
 *   post:
 *     summary: Notify a buyer via SMS that their order has been placed
 *     tags: [OTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gig
 *             properties:
 *               gig:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "I will design a clean minimalist logo for your brand"
 *     responses:
 *       200:
 *         description: Buyer notified successfully
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Failed to notify buyer
 */
router.post("/notify/order-placed", protectRoute, TermiiController.notifyOrderPlaced);

/**
 * @openapi
 * /api/otp/notify/order-completed:
 *   post:
 *     summary: Notify a buyer via SMS that their order has been completed
 *     tags: [OTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gig
 *             properties:
 *               gig:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     example: "I will design a clean minimalist logo for your brand"
 *     responses:
 *       200:
 *         description: Buyer notified successfully
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Failed to notify buyer
 */
router.post("/notify/order-completed", protectRoute, TermiiController.notifyOrderCompleted);

/**
 * @openapi
 * /api/otp/notify/payout-sent:
 *   post:
 *     summary: Notify a seller via SMS that their payout has been sent
 *     tags: [OTP]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Seller notified of payout
 *       404:
 *         description: User does not exist
 *       500:
 *         description: Failed to notify seller
 */
router.post("/notify/payout-sent", protectRoute, TermiiController.notifyPayoutSent);

export default router;