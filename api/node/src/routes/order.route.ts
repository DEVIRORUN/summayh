import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { protectRoute } from "../middleware/auth";

const router = Router();

/**
 * @openapi
 * /api/orders/create:
 *   post:
 *     summary: Create an Order and initialize payment
 *     description: Buyer creates an order for a Gig and initializes a Paystack transaction.
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrder'
 *
 *           example:
 *             buyerEmail: seyiadebayo@lautech.edu.ng
 *             serviceId: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *             amount: 5000
 *
 *     responses:
 *       200:
 *         description: Payment transaction initialized successfully
 *
 *       400:
 *         description: Invalid request body
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Gig not found
 *
 *       500:
 *         description: Internal server error
 */
router.post("/create", protectRoute, OrderController.createOrder);

/**
 * @openapi
 * /api/orders/buyer:
 *   get:
 *     summary: Get all orders belonging to the logged-in buyer
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *
 *     responses:
 *       200:
 *         description: Buyer orders retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */
router.get("/buyer", protectRoute, OrderController.getOrderAsBuyer);

/**
 * @openapi
 * /api/orders/seller:
 *   get:
 *     summary: Get all orders belonging to the logged-in seller
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *
 *     responses:
 *       200:
 *         description: Seller orders retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Internal server error
 */
router.get("/seller", protectRoute, OrderController.getOrderAsSeller);

/**
 * @openapi
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single Order
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Order ID
 *
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Internal server error
 */
router.get("/:orderId", protectRoute, OrderController.getOrder);

/**
 * @openapi
 * /api/orders/{orderId}/requirements:
 *   post:
 *     summary: Submit project requirements
 *
 *     description: Buyer submits project requirements and starts the delivery timer.
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitRequirements'
 *
 *           example:
 *             requirements:
 *               projectName: Student Startup Logo
 *
 *               colors:
 *                 - black
 *                 - white
 *
 *               references:
 *                 - https://example.com/image1.jpg
 *                 - https://example.com/image2.jpg
 *
 *               notes: Use a modern and minimalist style.
 *
 *     responses:
 *       200:
 *         description: Requirements submitted successfully
 *
 *       400:
 *         description: Invalid request
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Only buyer can submit requirements
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Internal server error
 */
router.post("/:orderId/requirements",  protectRoute, OrderController.submitOrderRequirements);

/**
 * @openapi
 * /api/orders/{orderId}/deliver:
 *   post:
 *     summary: Seller delivers completed work
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Internal server error
 */
router.post("/:orderId/deliver", protectRoute, OrderController.deliverOrder);

/**
 * @openapi
 * /api/orders/{orderId}/accept:
 *   post:
 *     summary: Buyer accepts delivered work
 *
 *     description: Escrow funds are released to the seller.
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Delivery accepted successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Internal server error
 */
router.post("/:orderId/accept", protectRoute, OrderController.acceptDelivery);

/**
 * @openapi
 * /api/orders/{orderId}/revision:
 *   post:
 *     summary: Buyer requests a revision
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Revision requested successfully
 *
 *       401:
 *         description: Unauthorized
 *
 *       403:
 *         description: Forbidden
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Internal server error
 */
router.post("/:orderId/revision", protectRoute, OrderController.requestRevision);

/**
 * @openapi
 * /api/orders/{orderId}/cancel:
 *   post:
 *     summary: Cancel an order
 *
 *     tags:
 *       - Orders
 *
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrder'
 *
 *           example:
 *             reason: Seller is unresponsive.
 *
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *
 *       400:
 *         description: Invalid request
 *
 *       401:
 *         description: Unauthorized
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Internal server error
 */
router.post("/:orderId/cancel", protectRoute, OrderController.cancelOrder);

export default router;