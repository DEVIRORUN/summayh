import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { protectRoute } from "../middleware/auth";
import { requireSeller } from "../middleware/isSeller";
import { DeliveryController } from "../controllers/delivery.controller"; 
import { OrderService } from "../services/order.service";
import { requireEmailVerified } from "../middleware/requireEmailVerified";

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
router.post("/create", protectRoute, requireEmailVerified, OrderController.createOrder);

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
router.get("/verify/:reference", protectRoute, OrderController.verifyOrderByReference);

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
 * @openapiders/:orderId/requirements
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

/**
 * @openapi
 * /api/orders/{orderId}/deliveries/upload-url:
 *   post:
 *     summary: Generate delivery file upload URL
 *     description: Generates a presigned URL or upload parameters for sellers to attach delivery files to an order.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the order.
 *     responses:
 *       200:
 *         description: Upload URL generated successfully.
 *       401:
 *         description: Unauthorized - Authentication required.
 *       403:
 *         description: Forbidden - Only the seller can perform this action.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:orderId/deliveries/upload-url", protectRoute, requireSeller, DeliveryController.getUploadUrl);

/**
 * @openapi
 * /api/orders/{orderId}/deliveries:
 *   post:
 *     summary: Submit order delivery
 *     description: Submits the final work or delivery files for an order to complete or fulfill a buyer's request.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the order.
 *     responses:
 *       201:
 *         description: Delivery submitted successfully.
 *       400:
 *         description: Bad request - Missing or invalid delivery parameters.
 *       401:
 *         description: Unauthorized - Authentication required.
 *       403:
 *         description: Forbidden - Only the seller can perform this action.
 *       404:
 *         description: Order not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:orderId/deliveries", protectRoute, requireSeller, DeliveryController.submitDelivery);

/**
 * @openapi
 * /api/orders/deliveries/{fileId}/download-url:
 *   get:
 *     summary: Get delivery file download URL
 *     description: Retrieves a secure presigned URL to download an order's delivery file.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the delivery file.
 *     responses:
 *       200:
 *         description: Download URL generated successfully.
 *       401:
 *         description: Unauthorized - Authentication required.
 *       403:
 *         description: Forbidden - User does not have access to this delivery file.
 *       404:
 *         description: File or delivery not found.
 *       500:
 *         description: Internal server error.
 */
router.get("/deliveries/:fileId/download-url", protectRoute, DeliveryController.getDownloadUrl);

/**
 * @openapi
 * /api/orders/{orderId}/schedule-session:
 *   post:
 *     summary: Get delivery file download URL
 *     description: Retrieves a secure presigned URL to download an order's delivery file.
 *     tags:
 *       - Orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the delivery file.
 *     responses:
 *       200:
 *         description: Download URL generated successfully.
 *       401:
 *         description: Unauthorized - Authentication required.
 *       403:
 *         description: Forbidden - User does not have access to this delivery file.
 *       404:
 *         description: File or delivery not found.
 *       500:
 *         description: Internal server error.
 */
router.post("/:orderId/schedule-session", protectRoute, OrderController.scheduleNextSession);
export default router;