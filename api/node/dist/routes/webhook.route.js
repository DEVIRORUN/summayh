"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentWebhook_controller_1 = require("../controllers/paymentWebhook.controller");
const router = (0, express_1.Router)();
/**
 * @openapi
 * /api/webhook/paystack:
 *  post:
 *      summary: Pays through paystack
 *      tags: [Payment Webhook]
 */
router.post('/paystack', paymentWebhook_controller_1.PaymentWebhookController.PaystackThread);
exports.default = router;
