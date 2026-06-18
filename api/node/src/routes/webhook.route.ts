import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import dotenv from "dotenv"
import { OrderService } from '../services/order.service';

const router = Router();

// IMPORTANT: Paystack verification requires the RAW request body to compute the hash correctly.
// Ensure your Express app uses express.json() but handles raw bodies if needed.

router.post('/paystack', async (req: Request, res: Response): Promise<any> => {
    try {
        const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

        if (!paystackSecret) {
            console.error("PAYSTACK_SECRET_KEY is missing from environment variables.");
            return res.status(500).json({
                error: "Server misconfiguration."
            });
        }

        // 1. Validate teh Paystack secure signature header
        const signature = req.headers['x-paystack-signature'] as string;

        if (!signature) {
            return res.status(401).send("Missing signature header");
        }

        // 2. Recompute teh hash using local secret key
        const hash = crypto
            .createHmac("sha512", paystackSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        // 3. Now we Compare hashes securely to verify identity
        if (hash !== signature) {
            console.warn('[Security Warning]: Unauthorized webhook signature mismatch dropped.');
            return res.status(401).send('Invalid event signature origin');
        }

        // 4. Extract even details safely now that it is verified
        const { event, data } = req.body;

        console.log(`[Webhook Received]: Paystack event triggered: ${event}`);

        /// Paystack sends various events; we care primarily about charge.success
        if (event === "charge.success") {
            await OrderService.handleSuccessfulPayment(data)
        }

        // 5. Always acknowledge Paystack immediately with a 200 OK status
        // If you don't respond, Paystack will flag your endpoint and retry periodically
        return res.status(200).send("Event processed successdully");

    } catch(error) {
        console.error("Webhook error:", error);
        return res.status(500).json({ message: "Internal server error during webhook processing." });
    }
});

export default router;