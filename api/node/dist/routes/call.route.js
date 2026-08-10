"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const call_controller_1 = require("../controllers/call.controller");
const router = (0, express_1.Router)();
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
router.post('/bookings/:bookingId/join', auth_1.protectRoute, call_controller_1.CallController.joinBookingSession);
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
router.get('/bookings/:bookingId/details', auth_1.protectRoute, call_controller_1.CallController.getBookingDetails);
exports.default = router;
