import { Router } from 'express';
import { PaymentWebhookController } from '../controllers/paymentWebhook.controller';

const router = Router();

/**
 * @openapi
 * /api/webhooks/paystack:
 *  post:
 *      summary: Pays through paystack
 *      tags: [Payment Webhook]
 */
router.post('/paystack', PaymentWebhookController.PaystackThread)

export default router;