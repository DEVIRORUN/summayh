import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/payment/balance:
 *   get:
 *     summary: Get the authenticated user's wallet balance
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/balance", protectRoute, PaymentController.getBalance);

/**
 * @openapi
 * /api/payment/summary:
 *   get:
 *     summary: Get the authenticated user's wallet summary
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/summary", protectRoute, PaymentController.getEarningsSummary);

/**
 * @openapi
 * /api/payment/ledger:
 *   get:
 *     summary: Get the authenticated user's ledger history
 *     tags: [Payment]
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
 *           default: 20
 *     responses:
 *       200:
 *         description: Ledger retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/ledger", protectRoute, PaymentController.getLedger);

/**
 * @openapi
 * /api/payment/withdraw:
 *   post:
 *     summary: Request a withdrawal to seller's bank account
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               bankDetails:
 *                 type: object
 *                 properties:
 *                   accountNumber:
 *                     type: string
 *                   bankCode:
 *                     type: string
 *                   accountName:
 *                     type: string
 *     responses:
 *       200:
 *         description: Withdrawal requested successfully
 *       400:
 *         description: Invalid request
 *       403:
 *         description: Not a seller
 *       500:
 *         description: Internal server error
 */
router.post("/withdraw", protectRoute, PaymentController.requestWithdrawal);

export default router;