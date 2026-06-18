import { Router } from "express"
import { OrderController } from "../controllers/order.controller"
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/orders/{id}/deliver:
 *   post:
 *     summary: Seller submits work as delivered
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post("/:id/deliver", protectRoute, OrderController.deliverOrder);

/**
 * @openapi
 * /api/orders/{id}/accept:
 *   post:
 *     summary: Buyer accepts delivery and triggers escrow release to seller
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order completed and funds released to seller
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post("/:id/accept", protectRoute, OrderController.acceptDelivery);

/**
 * @openapi
 * /api/orders/{id}/revision:
 *   post:
 *     summary: Buyer requests a revision on a delivered order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order sent back for revision
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post("/:id/revision", protectRoute, OrderController.requestRevision);
/**
 * @openapi
 * /api/orders/create:
 *   post:
 *     summary: Buyer creates an order and initializes payment
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [buyerEmail, serviceId, amount]
 *             properties:
 *               buyerEmail:
 *                 type: string
 *                 description: Email of the buyer (used for Paystack transaction)
 *                 default: "seyiadebayo@lautech.edu.ng"
 *               serviceId:
 *                 type: string
 *                 description: ID of the gig being ordered
 *                 default: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *               amount:
 *                 type: number
 *                 description: Total price of the order in Naira
 *                 default: 5000
 *     responses:
 *       200:
 *         description: Transaction initialized
 *       500:
 *         description: Could not create order
 */
router.post("/create", protectRoute, OrderController.createOrder);


export default router;