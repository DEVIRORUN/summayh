import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { CallController } from "../controllers/call.controller";

const router = Router();

/**
 * @openapi
 * /api/calls/bookings/{bookingId}/join:
 *   post:
 *     tags:
 *       - Calls
 *     summary: Join a scheduled call session
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The SessionBooking ID
 *     responses:
 *       200:
 *         description: Successfully joined, returns LiveKit token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 url:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *       403:
 *         description: Not a participant in this booking
 *       400:
 *         description: Session not joinable yet or booking has no order
 */
router.post('/bookings/:bookingId/join', protectRoute, CallController.joinBookingSession);
/**
 * @openapi
 * /api/calls/bookings/{bookingId}/details:
 *   get:
 *     tags:
 *       - Calls
 *     summary: Join a scheduled call session
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The SessionBooking ID
 *     responses:
 *       200:
 *         description: Successfully joined, returns LiveKit token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 url:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *       403:
 *         description: Not a participant in this booking
 *       400:
 *         description: Session not joinable yet or booking has no order
 */
router.get('/bookings/:bookingId/details', protectRoute, CallController.getBookingDetails);

export default router;